import axios, {AxiosError, type InternalAxiosRequestConfig} from 'axios';
import {useAuthStore} from "../store/useAuthStore.ts";
import {authApi} from "./authApi.ts";

const baseURLenv = import.meta.env.VITE_APP_API_BE_URL || 'http://localhost:8809';
const axiosClient = axios.create({
    baseURL: baseURLenv,
    withCredentials: true,
    headers: {
        'content-type': 'application/json',
    }
});
//Cờ Mutex và Hàng đợi để xử lý Concurrent 401 Requests
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void, reject: (Error: any) => void }> = [];
const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token as string);
    });
    failedQueue = [];
}
//  Tự động nhét Access Token vào Header
axiosClient.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Xử lý 401 Auto Refresh
axiosClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        if (error.response?.status !== 401
            ||
            originalRequest.url?.includes('/api/auth/')) {
            return Promise.reject(error);
        }
        if (originalRequest._retry) {
            useAuthStore.getState().clearAuth();
            window.location.href = '/login';
            return Promise.reject(error);
        }
        if (isRefreshing){
            // Nếu đang refresh dở, nhét các request bị lỗi vào hàng đợi (Queue) chờ token mới
            return  new Promise(function (resolve, reject) {
                failedQueue.push({resolve,reject});
            })
                .then((token)=>{
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axiosClient(originalRequest);
                })
                .catch((err)=>Promise.reject(err));
        }
        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const resp=await authApi.refreshToken();
            const  newAccessToken=resp.data.data.accessToken;
            // cap nhat accessToken moi
            useAuthStore.getState().setAuth(newAccessToken);
            // cap nhat header Authorization
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            // su ly thanh cong Queue
            processQueue(null,newAccessToken);

            // gui lai request teo ban dau

            return  axiosClient(originalRequest);

        }catch (e) {
            // refresh that bai
            processQueue(e, null);
            useAuthStore.getState().clearAuth();// xoa token torng ram
            window.location.href='/login';
            return Promise.reject(e);
         } finally {
            isRefreshing = false;
        }
        return Promise.reject(error);

    }
);
export default axiosClient;