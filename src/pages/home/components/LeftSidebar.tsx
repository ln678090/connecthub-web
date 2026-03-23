import {Bell, Home, LogOut, MessageCircle, Settings, User, Users} from "lucide-react";
import {useLocation, useNavigate} from "react-router-dom";
import {useAuthStore} from "../../../store/useAuthStore.ts";
import {authApi} from "../../../api/authApi.ts";
import logo from "@/assets/logo_ConnectHub.png";

type LeftSidebarProps = {};


    const navItems = [
        { icon: Home,          label: 'Trang chủ',  path: '/' },
        { icon: Users,         label: 'Bạn bè',     path: '/friends' },
        { icon: MessageCircle, label: 'Tin nhắn',   path: '/messages' },
        { icon: Bell,          label: 'Thông báo',  path: '/notifications' },
        { icon: User,          label: 'Hồ sơ',      path: '/profile' },
        { icon: Settings,      label: 'Cài đặt',    path: '/settings' },
    ];
export default function LeftSidebar({}: LeftSidebarProps) {

    const navigate = useNavigate();
    const location = useLocation();
    const clearAuth = useAuthStore((s) => s.clearAuth);

    const handleLogout = async () => {
        try {
            await authApi.logout();
        } catch (_) {}
        finally {
            clearAuth();
            navigate('/login', { replace: true });
        }
    };
    return (
        <aside className="flex h-screen w-64 flex-col justify-between border-r border-gray-100 bg-white px-4 py-6 sticky top-0">
            {/* LOGO */}
            <div>
                <div className="mb-8 flex items-center gap-2 px-2">
                    <img src={logo} alt="ConnectHub" className="h-25 w-auto object-contain mix-blend-multiply" />
                </div>

                {/* NAV ITEMS */}
                <nav className="flex flex-col gap-1">
                    {navItems.map(({ icon: Icon, label, path }) => {
                        const isActive = location.pathname === path;
                        return (
                            <button
                                key={path}
                                onClick={() => navigate(path)}
                                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                                    isActive
                                        ? 'bg-gradient-to-r from-[#2e62a0]/10 to-[#71bc59]/10 text-[#2e62a0] font-semibold'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                                }`}
                            >
                                <Icon
                                    size={20}
                                    className={isActive ? 'text-[#2e62a0]' : 'text-gray-400'}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                {label}
                                {/* Chấm báo hiệu active */}
                                {isActive && (
                                    <span className="ml-auto h-2 w-2 rounded-full bg-[#71bc59]" />
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* LOGOUT */}
            <button
                onClick={handleLogout}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-50 hover:text-red-600"
            >
                <LogOut size={20} />
                Đăng xuất
            </button>
        </aside>
    );
}