import {create} from 'zustand';
import {jwtDecode} from "jwt-decode";

// Giao diện dữ liệu được lấy từ JWT Payload do Backend trả về
interface UserPayload {
    sub: string;    // Backend dùng 'sub' để lưu UUID của User
    roles: string;
    exp: number;
    iat: number;
    iss: string;
}
interface AuthState {
    accessToken: string | null;
    user: { id: string, roles: string } | null;
    isAuthenticated: boolean;
    isInitialized: boolean;
    setAuth: (token: string) => void;
    clearAuth: () => void;
    setInitialized: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    accessToken: null,
    user: null,
    isAuthenticated: false,
    isInitialized: false,

    setAuth: (token: string) => {
        try {
            // Giải mã token để lấy thông tin User
            const decoded = jwtDecode<UserPayload>(token);
            set({
                accessToken: token,
                user: { id: decoded.sub, roles: decoded.roles }, // Lưu ID để các component khác dùng
                isAuthenticated: true
            });
        } catch (error) {
            console.error("Invalid token format", error);
            set({ accessToken: null, user: null, isAuthenticated: false });
        }
    },

    clearAuth: () => set({
        accessToken: null,
        user: null,
        isAuthenticated: false
    }),

    setInitialized: () => set({ isInitialized: true }),
}));