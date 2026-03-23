import axios from 'axios';

const baseURLenv = import.meta.env.VITE_APP_API_BE_URL || 'http://localhost:8809';
const authClient = axios.create({
    baseURL: baseURLenv,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
}

export interface TokenResponse {
    message: string;
    data: {
        accessToken: string;
        tokenType: string;
    };
    timestamp: string;
}

export const authApi = {
    login: (payload: LoginPayload) => {
        return authClient.post<TokenResponse>('/api/auth/login', payload);
    },

    register: (payload: RegisterPayload) => {
        return authClient.post<TokenResponse>('/api/auth/register', payload);
    },

    refreshToken: () => {
        return authClient.post<TokenResponse>('/api/auth/refresh');
    },

    logout: () => {
        return authClient.post('/api/auth/logout');
    },

    getMe: () => {
        return authClient.get('/api/auth/me');
    },
};