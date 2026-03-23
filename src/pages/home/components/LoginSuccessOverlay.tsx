import {useEffect, useState} from "react";
import logo from "@/assets/logo_ConnectHub.png";
import {createPortal} from "react-dom";


interface Props {
    visible: boolean;
    onDone: () => void;
}
export default function LoginSuccessOverlay({ visible, onDone }: Props) {
    const [isExiting, setIsExiting] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (!visible) return;

        // Delay 1 frame để browser kịp paint trước khi animation chạy
        const mountTimer = setTimeout(() => setMounted(true), 16);
        const exitTimer  = setTimeout(() => setIsExiting(true), 1800);
        const doneTimer  = setTimeout(() => onDone(), 2300);

        return () => {
            clearTimeout(mountTimer);
            clearTimeout(exitTimer);
            clearTimeout(doneTimer);
        };
    }, [visible]);

    if (!visible) return null;
    return createPortal(
        <div
            style={{
                animation: !mounted
                    ? 'none'
                    : isExiting
                        ? 'overlayOut 0.5s ease-in forwards'
                        : 'overlayIn 0.4s ease-out forwards',
                opacity: mounted ? undefined : 0,
            }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-[#2e62a0] via-[#1a4f8a] to-[#71bc59]"
        >
            {/* Blob trang trí */}
            <div className="absolute top-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-white/5 blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] h-[400px] w-[400px] rounded-full bg-white/5 blur-3xl pointer-events-none" />

            {/* Nội dung */}
            <div
                style={{ animation: mounted ? 'contentUp 0.5s ease-out 0.15s both' : 'none' }}
                className="flex flex-col items-center gap-6 text-center"
            >
                {/* Logo + vòng xoay */}
                <div className="relative">
                    <div className="absolute inset-0 -m-2 rounded-full border-4 border-white/20 border-t-white animate-spin" />
                    <div className="h-24 w-24 overflow-hidden rounded-full bg-white p-2 shadow-2xl">
                        <img
                            src={logo}
                            alt="ConnectHub"
                            className="h-full w-full object-contain mix-blend-multiply"
                        />
                    </div>
                </div>

                <div>
                    <h2 className="text-3xl font-extrabold text-white drop-shadow-lg tracking-tight">
                        Chào mừng trở lại! 🎉
                    </h2>
                    <p className="mt-2 text-white/80 text-sm font-light tracking-wide">
                        Đang đưa bạn vào ConnectHub...
                    </p>
                </div>

                {/* Loading dots */}
                <div className="flex gap-2">
                    {[0, 1, 2].map((i) => (
                        <span
                            key={i}
                            className="h-2.5 w-2.5 rounded-full bg-white/80 animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                        />
                    ))}
                </div>
            </div>
        </div>,
        document.body
    );
}