import axiosClient from "./axiosClient.ts";
import type {ApiResp} from "../types/auth.type.ts";


export interface UserSuggestion {
    id: string;
    name: string;
    avatar: string;
    mutualFriends: number;
}

export const friendApi = {
    getSuggestions: () =>
        axiosClient.get<{ data: UserSuggestion[] }>('/api/users/suggestions'),

    sendFriendRequest: (userId: string) =>
        axiosClient.post<ApiResp<{ success: boolean }>>(`/api/friends/request/${userId}`),
    acceptRequest: (userId: string) =>
        axiosClient.post(`/api/friends/request/${userId}/accept`),

    rejectRequest: (userId: string) =>
        axiosClient.post(`/api/friends/request/${userId}/reject`),

    cancelRequest: (userId: string) =>
        axiosClient.delete(`/api/friends/request/${userId}/cancel`),

    unfriend: (userId: string) =>
        axiosClient.delete(`/api/friends/${userId}/unfriend`),
    getFriends: (cursor?: string | null, limit: number = 10) =>
        axiosClient.get(`/api/friends`, { params: { cursor, limit } }),
};
