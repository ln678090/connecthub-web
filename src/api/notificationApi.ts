import axiosClient from './axiosClient';

export interface ActorInfo {
    id: string;
    fullName: string;
    avatarUrl: string;
}

export interface NotificationResp {
    id: string;
    type: string;
    referenceId: string;
    isRead: boolean;
    actorCount: number;
    updatedAt: string;
    actor: ActorInfo;
}

export interface CursorPageResponse<T> {
    data: T[];
    nextCursor: string;
    hasNext: boolean;
}

export const notificationApi = {
    getNotifications: (cursor?: string, size = 10) => {
        const params = new URLSearchParams();
        params.append('size', size.toString());
        if (cursor) params.append('cursor', cursor);

        return axiosClient.get<{ data: CursorPageResponse<NotificationResp> }>(
            `/api/notifications?${params.toString()}`
        );
    },

    getUnreadCount: () => {
        return axiosClient.get<{ data: number }>('/api/notifications/unread-count');
    },

    markAsRead: (id: string) => {
        return axiosClient.put(`/api/notifications/${id}/read`);
    },

    markAllAsRead: () => {
        return axiosClient.put('/api/notifications/read-all');
    }
};