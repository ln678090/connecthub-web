import axiosClient from "./axiosClient.ts";

interface ApiProfileResp{
    message: string;
    data: UserprofileResp;
    timestamp: string;
}
interface UserprofileResp{
    fullName:string;
    bio:string;
    location:string;
    websiteUrl:string;
    avatarUrl :string;
    coverUrl :string;
    friendshipStatus: 'NONE' | 'FRIENDS' | 'REQUEST_SENT' | 'REQUEST_RECEIVED' | 'SELF';
    followerCount :number;
    followingCount:number;
    isFollowing:boolean;
}


export const userApi = {

    getProfile: ( id: string) => axiosClient.get<ApiProfileResp>(`/api/users/profile/${id}`),


    updateAvatar: (avatarUrl: string) => axiosClient.put('/api/users/profile/avatar', { avatarUrl }),
    updateCover: (coverUrl: string) => axiosClient.put('/api/users/profile/cover', { coverUrl }),


    updateProfile: (data: { bio: string; location: string; websiteUrl: string; fullName: string }) =>
        axiosClient.put('/api/users/profile', data),
    followUser: (userId: string) => axiosClient.post(`/api/follow/${userId}`),
    unfollowUser: (userId: string) => axiosClient.delete(`/api/follow/${userId}`),

}