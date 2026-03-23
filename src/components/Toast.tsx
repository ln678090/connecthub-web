import {useEffect, useState} from 'react';
import {createPortal} from 'react-dom';
import {CheckCircle, X, XCircle} from 'lucide-react';
import {useToastStore} from "../store/useToastStore.ts";

export type ToastType = 'success' | 'error';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Trigger enter animation
        const t1 = setTimeout(() => setVisible(true), 10);
        // Auto close sau 3s
        const t2 = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 300);
        }, 3000);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, []);

    return createPortal(
        <div
            style={{ animation: visible ? 'toastIn 0.3s ease forwards' : 'toastOut 0.3s ease forwards' }}
            className={`fixed bottom-6 right-6 z-[9998] flex items-center gap-3 rounded-2xl px-5 py-4 shadow-2xl text-white text-sm font-medium min-w-[280px] ${
                type === 'success'
                    ? 'bg-gradient-to-r from-[#2e62a0] to-[#71bc59]'
                    : 'bg-gradient-to-r from-red-500 to-rose-600'
            }`}
        >
            {type === 'success'
                ? <CheckCircle size={20} className="shrink-0" />
                : <XCircle size={20} className="shrink-0" />
            }
            <span className="flex-1">{message}</span>
            <button onClick={onClose} className="shrink-0 opacity-70 hover:opacity-100 transition">
                <X size={16} />
            </button>
        </div>,
        document.body
    );
}
export function GlobalToasts() {
    const { toasts, remove } = useToastStore();
    return (
        <>
            {toasts.map((t) => (
                <Toast key={t.id} message={t.message} type={t.type} onClose={() => remove(t.id)} />
            ))}
        </>
    );
}