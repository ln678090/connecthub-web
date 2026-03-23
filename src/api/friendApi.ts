import axiosClient from "./axiosClient.ts";


export interface UserSuggestion {
    id: number;
    name: string;
    avatar: string;
    mutualFriends: number;
}

export const friendApi = {
    getSuggestions: () =>
        axiosClient.get<{ data: UserSuggestion[] }>('/api/users/suggestions'),

    sendRequest: (userId: number) =>
        axiosClient.post(`/api/friends/request/${userId}`),
};
