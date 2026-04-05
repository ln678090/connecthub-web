import axiosClient from "./axiosClient.ts";


export interface PostDTO {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    createdAt: string;
    content: string;
    imageUrl?: string;
    likeCount: number;
    commentCount: number;
    likedByMe: boolean;
}

export interface PageResponse<T> {
    content: T[];
    last: boolean;
    totalElements: number;
}
// Cấu trúc mới từ Backend trả về
export interface CursorPageResponse<T> {
    posts: T[];
    nextCursor: string;
    hasNext: boolean;
}

export const postApi = {

    getFeed: (cursorData: any = "", size = 5) => {
             const params = new URLSearchParams();
        params.append("size", size.toString());

        if (cursorData && typeof cursorData === 'object') {
            if (cursorData.createdAt) params.append("createdAt", cursorData.createdAt);
            if (cursorData.id) params.append("id", cursorData.id);
        }

        return axiosClient.get<{ data: CursorPageResponse<PostDTO> }>(`/api/feed?${params.toString()}`);
    },
    getUserPosts: (userId: string, cursorData: any = "", size = 5) => {
        const params = new URLSearchParams();
        params.append("size", size.toString());

        if (cursorData && typeof cursorData === 'object') {
            if (cursorData.createdAt) params.append("createdAt", cursorData.createdAt);
            if (cursorData.id) params.append("id", cursorData.id);
        }


        return axiosClient.get<{ data: CursorPageResponse<PostDTO> }>(`/api/posts/users/${userId}?${params.toString()}`);
    },
    createPost: (data: { content: string; imageUrl?: string }) =>
        axiosClient.post<{ data: PostDTO }>('/api/posts', data),

    toggleLike: (postId: string) =>
        axiosClient.post(`/api/posts/${postId}/like`),

    deletePost: (postId: string) =>
        axiosClient.delete(`/api/posts/${postId}`),
    getPostById(postId: string) {
        return axiosClient.get<{ data: PostDTO }>(`/api/posts/${postId}`);
    }
};