import {useLocation, useNavigate} from "react-router-dom";
import * as z from 'zod';
import {useAuthStore} from "../../store/useAuthStore.ts";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {authApi} from "../../api/authApi.ts";
import logo from "@/assets/logo_ConnectHub.png";
import LoginSuccessOverlay from "../home/components/LoginSuccessOverlay.tsx";


type AuthPageProps = {};


const loginSchema = z.object({
    email: z.string().email({message: 'Email không hợp lệ'}),
    password: z.string().min(6, {message: 'Mật khẩu ít nhất 6 ký tự'})
});

const registerSchema = z.object({
    fullName: z.string().min(2, {message: 'Tên quá ngắn'}),
    email: z.string().email({message: 'Email không hợp lệ'}),
    password: z.string().min(6, {message: 'Mật khẩu ít nhất 6 ký tự'})
});

type LoginInputs = z.infer<typeof loginSchema>;
type RegisterInputs = z.infer<typeof registerSchema>;

export default function AuthPage({}: AuthPageProps) {
    const [showOverlay, setShowOverlay] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);
// Xác định trạng thái ban đầu dựa vào URL nếu vào /register thì lật luôn qua phải
    const [isRegister, setIsRegister] = useState(location.pathname === '/register');
    const [serverError, setServerError] = useState('');
    const loginForm = useForm<LoginInputs>({resolver: zodResolver(loginSchema)});
    const registerForm = useForm<RegisterInputs>({resolver: zodResolver(registerSchema)});
    // Xử lý nút gạt chuyển đổi
    const toggleMode = () => {
        setIsRegister(!isRegister);
        setServerError('');
        loginForm.reset();
        registerForm.reset();
        // Thay đổi URL ngầm để người dùng dễ F5 hoặc Copy Link
        window.history.pushState({}, '', isRegister ? '/login' : '/register');
    };
    const [pendingToken, setPendingToken] = useState<string | null>(null);

    const onLoginSubmit = async (data: LoginInputs) => {
        try {
            setServerError('');
            const resp = await authApi.login({email: data.email, password: data.password});
            // setAuth(resp.data.data.accessToken);
            // window.location.href = '/';
            setPendingToken(resp.data.data.accessToken);
            setShowOverlay(true);
        } catch (error: any) {
            setServerError(error.response?.data?.message || 'Đăng nhập thất bại.');
        }
    };
    const onRegisterSubmit = async (data: RegisterInputs) => {
        try {
            setServerError('');
            const resp = await authApi.register({
                fullName: data.fullName, // Tuỳ cấu trúc API backend của bạn (name hay fullName)
                email: data.email,
                password: data.password
            });
            // setAuth(resp.data.data.accessToken);
            // window.location.href = '/';
            setPendingToken(resp.data.data.accessToken);
            setShowOverlay(true);
        } catch (error: any) {
            setServerError(error.response?.data?.message || 'Đăng ký thất bại.');
        }
    };

    return (
        <>
            <LoginSuccessOverlay
                visible={showOverlay}
                onDone={() => {
                    if (pendingToken) setAuth(pendingToken);
                    navigate('/', { replace: true });
                }}
            />

          
            <div className="flex min-h-screen items-center justify-center bg-[#f3f4f6] p-4 font-sans text-gray-900">

                {/*
        Tăng max-width lên 1100px và chiều cao lên 650px để tạo không gian (white space)
        giúp giao diện trông thoáng, sang trọng, không bị "bức bí"
      */}
                <div
                    className="relative w-full max-w-[1100px] h-[650px] overflow-hidden rounded-[2.5rem] bg-white shadow-2xl">

                    {/* ======================================= */}
                    {/* PANNEL 1: FORM ĐĂNG KÝ (Trượt từ trái qua) */}
                    {/* ======================================= */}
                    <div
                        className={`absolute top-0 left-0 h-full w-1/2 p-16 transition-all duration-700 ease-in-out ${
                            isRegister ? 'translate-x-full opacity-100 z-10' : 'translate-x-0 opacity-0 z-0'
                        }`}
                    >
                        <div className="flex h-full flex-col justify-center max-w-sm mx-auto">
                            {/* Thêm Logo ở Form Đăng Ký */}
                            <div className="mb-6 flex justify-center">
                                <img src={logo} alt="ConnectHub Logo"
                                     className="h-31 w-auto object-contain mix-blend-multiply"/>
                            </div>

                            <h2 className="mb-2 text-center text-3xl font-extrabold text-gray-800">Tạo tài khoản</h2>
                            <p className="mb-8 text-center text-sm text-gray-500">Tham gia ConnectHub ngay hôm nay.</p>

                            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                                  className="flex flex-col gap-5">
                                <div>
                                    <input
                                        {...registerForm.register('fullName')}
                                        type="text" placeholder="Họ và Tên"
                                        className="w-full rounded-xl bg-gray-100/80 px-5 py-3.5 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-[#2e62a0]"
                                    />
                                    {registerForm.formState.errors.fullName &&
                                        <p className="mt-1 text-xs text-red-500">{registerForm.formState.errors.fullName.message}</p>}
                                </div>

                                <div>
                                    <input
                                        {...registerForm.register('email')}
                                        type="email" placeholder="Email của bạn"
                                        className="w-full rounded-xl bg-gray-100/80 px-5 py-3.5 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-[#2e62a0]"
                                    />
                                    {registerForm.formState.errors.email &&
                                        <p className="mt-1 text-xs text-red-500">{registerForm.formState.errors.email.message}</p>}
                                </div>

                                <div>
                                    <input
                                        {...registerForm.register('password')}
                                        type="password" placeholder="Mật khẩu"
                                        className="w-full rounded-xl bg-gray-100/80 px-5 py-3.5 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-[#2e62a0]"
                                    />
                                    {registerForm.formState.errors.password &&
                                        <p className="mt-1 text-xs text-red-500">{registerForm.formState.errors.password.message}</p>}
                                </div>

                                {serverError && isRegister &&
                                    <p className="text-center text-sm font-semibold text-red-500">{serverError}</p>}

                                <button
                                    disabled={registerForm.formState.isSubmitting}
                                    className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#2e62a0] to-[#71bc59] p-3.5 font-bold tracking-wide text-white transition hover:opacity-90 shadow-md hover:shadow-lg"
                                >
                                    {registerForm.formState.isSubmitting ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* ======================================= */}
                    {/* PANNEL 2: FORM ĐĂNG NHẬP (Mặc định ở bên trái) */}
                    {/* ======================================= */}
                    <div
                        className={`absolute top-0 left-0 h-full w-1/2 p-16 transition-all duration-700 ease-in-out ${
                            isRegister ? 'translate-x-[100%] opacity-0 z-0' : 'translate-x-0 opacity-100 z-10'
                        }`}
                    >
                        <div className="flex h-full flex-col justify-center max-w-sm mx-auto">
                            {/* Thêm Logo ở Form Đăng Nhập */}
                            <div className="mb-6 flex justify-center">
                                <img src={logo} alt="ConnectHub Logo"
                                     className="h-31 w-auto object-contain mix-blend-multiply"/>
                            </div>

                            <h2 className="mb-2 text-center text-3xl font-extrabold text-gray-800">Mừng trở lại!</h2>
                            <p className="mb-8 text-center text-sm text-gray-500">Đăng nhập để kết nối với bạn bè.</p>

                            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="flex flex-col gap-5">
                                <div>
                                    <input
                                        {...loginForm.register('email')}
                                        type="email" placeholder="Email của bạn"
                                        className="w-full rounded-xl bg-gray-100/80 px-5 py-3.5 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-[#2e62a0]"
                                    />
                                    {loginForm.formState.errors.email &&
                                        <p className="mt-1 text-xs text-red-500">{loginForm.formState.errors.email.message}</p>}
                                </div>

                                <div>
                                    <input
                                        {...loginForm.register('password')}
                                        type="password" placeholder="Mật khẩu"
                                        className="w-full rounded-xl bg-gray-100/80 px-5 py-3.5 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-[#2e62a0]"
                                    />
                                    {loginForm.formState.errors.password &&
                                        <p className="mt-1 text-xs text-red-500">{loginForm.formState.errors.password.message}</p>}
                                </div>

                                <div className="text-right mt-1">
                                    <a href="#"
                                       className="text-sm font-semibold text-[#2e62a0] hover:text-[#71bc59] transition-colors">Quên
                                        mật khẩu?</a>
                                </div>

                                {serverError && !isRegister &&
                                    <p className="text-center text-sm font-semibold text-red-500">{serverError}</p>}

                                <button
                                    disabled={loginForm.formState.isSubmitting}
                                    className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#2e62a0] to-[#71bc59] p-3.5 font-bold tracking-wide text-white transition hover:opacity-90 shadow-md hover:shadow-lg"
                                >
                                    {loginForm.formState.isSubmitting ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* ======================================= */}
                    {/* PANNEL 3: LỚP OVERLAY TRƯỢT */}
                    {/* ======================================= */}
                    <div
                        className={`absolute top-0 left-1/2 h-full w-1/2 overflow-hidden transition-transform duration-700 ease-in-out z-50 ${
                            isRegister ? '-translate-x-full' : 'translate-x-0'
                        }`}
                    >
                        {/*
            Lớp nền Gradient: Thay vì màu Tím/Hồng lúc nãy, mình đã điều chỉnh
            gradient theo tông màu chủ đạo của Logo (Xanh Dương #2e62a0 và Xanh Lá #71bc59)
          */}
                        <div
                            className={`relative -left-full h-full w-[200%] bg-gradient-to-br from-[#2e62a0] to-[#71bc59] text-white transition-transform duration-700 ease-in-out ${
                                isRegister ? 'translate-x-1/2' : 'translate-x-0'
                            }`}
                        >

                            {/* Overlay Trái (hiện khi đang ở màn Đăng ký, mời Đăng nhập) */}
                            <div
                                className={`absolute top-0 left-0 flex h-full w-1/2 flex-col items-center justify-center px-16 text-center transition-transform duration-700 ease-in-out ${
                                    isRegister ? 'translate-x-0' : '-translate-x-[20%]'
                                }`}
                            >
                                <h2 className="mb-6 text-4xl font-extrabold text-white drop-shadow-md tracking-tight">Đã
                                    có tài khoản?</h2>
                                <p className="mb-10 text-lg text-white/90 leading-relaxed font-light">
                                    Đăng nhập ngay để tiếp tục trải nghiệm và kết nối với mạng lưới của bạn!
                                </p>
                                <button
                                    onClick={toggleMode}
                                    className="rounded-full border-2 border-white/80 bg-white/10 backdrop-blur-sm px-12 py-3.5 font-bold uppercase tracking-wider text-white transition hover:bg-white hover:text-[#2e62a0] shadow-xl"
                                >
                                    Đăng nhập
                                </button>
                            </div>

                            {/* Overlay Phải (hiện khi đang ở màn Đăng nhập, mời Đăng ký) */}
                            <div
                                className={`absolute top-0 right-0 flex h-full w-1/2 flex-col items-center justify-center px-16 text-center transition-transform duration-700 ease-in-out ${
                                    isRegister ? 'translate-x-[20%]' : 'translate-x-0'
                                }`}
                            >
                                <h2 className="mb-6 text-4xl font-extrabold text-white drop-shadow-md tracking-tight">Người
                                    mới à?</h2>
                                <p className="mb-10 text-lg text-white/90 leading-relaxed font-light">
                                    Hãy gia nhập cộng đồng của chúng tôi và khám phá những điều tuyệt vời nhất!
                                </p>
                                <button
                                    onClick={toggleMode}
                                    className="rounded-full border-2 border-white/80 bg-white/10 backdrop-blur-sm px-12 py-3.5 font-bold uppercase tracking-wider text-white transition hover:bg-white hover:text-[#71bc59] shadow-xl"
                                >
                                    Tạo tài khoản
                                </button>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}