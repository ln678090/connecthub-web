import axiosClient from "./axiosClient.ts";


export interface AuthorDto {
    id:string;
    fullName: string;
    avatarUrl?: string;
}

export interface CommentResponse {
    id:string;
    postId:string;
    parentId?:string;
    content:string;
    author:AuthorDto;
    createdAt: string;
    replyCount: number;
}

export interface CommentRequest{
    content:string;
    parentId:string;
}

export interface CursorPageResponse<T> {
    data: T[];
    nextCursor: string | null;
    hasNext: boolean;
}
const commentApi={
    getTopLevelComments: (postId: string, cursor: string | null = null, limit = 5) => {
        const params = new URLSearchParams();
        params.append("limit", limit.toString());
        if (cursor) params.append("cursor", cursor);
        return axiosClient.get<{ message: string, data: CursorPageResponse<CommentResponse> }>(
            `/api/posts/${postId}/comments?${params.toString()}`
        );
    },

    // SỬA: Lấy các câu trả lời (replies) dùng Cursor
    getReplies: (parentId: string, cursor: string | null = null, limit = 5) => {
        const params = new URLSearchParams();
        params.append("limit", limit.toString());
        if (cursor) params.append("cursor", cursor);
        return axiosClient.get<{ message: string, data: CursorPageResponse<CommentResponse> }>(
            `/api/posts/comments/${parentId}/replies?${params.toString()}`
        );
    },
    getCommentById: (commentId: string) => {
        return axiosClient.get(`/api/posts/comments/${commentId}/detail`);
    },
    // Tạo bình luận mới (gốc hoặc trả lời)
    createComment: (postId: string, data: CommentRequest) =>
        axiosClient.post(`/api/posts/${postId}/comments`, data),

    // Xóa bình luận
    deleteComment: (commentId: string) =>
        axiosClient.delete(`/api/posts/comments/${commentId}`),
}
export default commentApi;