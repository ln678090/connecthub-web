import {useAuthStore} from "../store/useAuthStore.ts";
import {useEffect} from "react";
import {authApi} from "../api/authApi.ts";
import {Navigate, Outlet} from 'react-router-dom';

export  const ProtectedRoute=()=>{
    const {isAuthenticated,setInitialized,setAuth,clearAuth,isInitialized}=useAuthStore();

    useEffect(() => {
        if (isInitialized) return;
        //  Khi F5, state mất. Ta gọi ngầm API refresh để phục hồi đăng nhập.
        const  initializeAuth=async ()=>{
            if (isAuthenticated){
                setInitialized();
                return;
            }
            try {
                const resp=await authApi.refreshToken();
                 setAuth(resp.data.data.accessToken);
            } catch (e) {
                console.warn('Silent refresh failed. User is not logged in.');
              clearAuth();
            } finally {
                setInitialized();
            }
        };
        initializeAuth();
    }, [isAuthenticated, isInitialized, setAuth, clearAuth, setInitialized]);

    if (!isInitialized){
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
                <div  className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }


    return isAuthenticated ? <Outlet/> : <Navigate to="/login" replace/>;
}