import {useAuthStore} from "../store/useAuthStore.ts";
import {Navigate, Outlet} from "react-router-dom";

type PublicRouteProps = {};

export default function PublicRoute({}: PublicRouteProps) {
    const isAuthenticated=useAuthStore((state)=>state.isAuthenticated)
// Nếu đã đăng nhập, đá về trang chủ
    if (isAuthenticated) {
        return <Navigate to="/" replace/>;
    }
    // Nếu chưa đăng nhập, cho phép render component con (Login / Register)
    return <Outlet/>;
}