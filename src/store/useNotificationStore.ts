import { create } from 'zustand';
import { notificationApi, type NotificationResp } from '../api/notificationApi';

interface NotificationStore {
    notifications: NotificationResp[];
    unreadCount: number;
    isLoading: boolean;
    isLoadingMore: boolean;
    hasNext: boolean;
    nextCursor: string | null;
    intervalId: number | null;

    fetchNotifications: () => Promise<void>;
    loadMore: () => Promise<void>;
    fetchUnreadCount: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;

    startPolling: () => void;
    stopPolling: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    isLoadingMore: false,
    hasNext: false,
    nextCursor: null,
    intervalId: null,

    // fetchNotifications: async () => {
    //     set({ isLoading: true });
    //     try {
    //         const resp = await notificationApi.getNotifications();
    //         set({
    //             notifications: resp.data.data.data,
    //             nextCursor: resp.data.data.nextCursor,
    //             hasNext: resp.data.data.hasNext
    //         });
    //     } catch (error) {
    //         console.error("Lỗi lấy thông báo:", error);
    //     } finally {
    //         set({ isLoading: false });
    //     }
    // },
    fetchNotifications: async () => {
        set({ isLoading: true });
        try {
            const resp = await notificationApi.getNotifications();
            set({
                notifications: resp.data.data.data, // Ghi đè toàn bộ mảng bằng dữ liệu mới nhất
                nextCursor: resp.data.data.nextCursor,
                hasNext: resp.data.data.hasNext
            });
        } catch (error) {
            console.error("Lỗi lấy thông báo:", error);
        } finally {
            set({ isLoading: false });
        }
    },
    loadMore: async () => {
        const { nextCursor, hasNext, isLoadingMore } = get();
        if (!hasNext || isLoadingMore || !nextCursor) return;

        set({ isLoadingMore: true });
        try {
            const resp = await notificationApi.getNotifications(nextCursor);
            set((state) => ({
                notifications: [...state.notifications, ...resp.data.data.data],
                nextCursor: resp.data.data.nextCursor,
                hasNext: resp.data.data.hasNext
            }));
        } catch (error) {
            console.error("Lỗi load more thông báo:", error);
        } finally {
            set({ isLoadingMore: false });
        }
    },

    fetchUnreadCount: async () => {
        try {
            const resp = await notificationApi.getUnreadCount();
            set({ unreadCount: resp.data.data });
        } catch (error) {
            console.error("Lỗi đếm số lượng unread:", error);
        }
    },

    markAsRead: async (id: string) => {
        try {
            await notificationApi.markAsRead(id);
            set((state) => ({
                notifications: state.notifications.map(n =>
                    n.id === id ? { ...n, isRead: true } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1)
            }));
        } catch (error) {
            console.error("Lỗi mark as read:", error);
        }
    },

    markAllAsRead: async () => {
        try {
            await notificationApi.markAllAsRead();
            set((state) => ({
                notifications: state.notifications.map(n => ({ ...n, isRead: true })),
                unreadCount: 0
            }));
        } catch (error) {
            console.error("Lỗi mark all read:", error);
        }
    },

    startPolling: () => {
        const { intervalId, fetchUnreadCount } = get();
        if (intervalId) return; // Tránh chạy 2 lần

        // Gọi luôn phát đầu
        fetchUnreadCount();


        const id = setInterval(() => {
            get().fetchUnreadCount();
        }, 30000) as unknown as number;

        set({ intervalId: id });
    },

    stopPolling: () => {
        const { intervalId } = get();
        if (intervalId) {
            clearInterval(intervalId);
            set({ intervalId: null });
        }
    }
}));