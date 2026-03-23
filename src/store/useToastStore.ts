import {create} from 'zustand';
import {ToastType} from '../components/Toast';

interface ToastItem {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastStore {
    toasts: ToastItem[];
    show: (message: string, type?: ToastType) => void;
    remove: (id: number) => void;
}

let counter = 0;

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],
    show: (message, type = 'success') =>
        set((s) => ({ toasts: [...s.toasts, { id: ++counter, message, type }] })),
    remove: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
