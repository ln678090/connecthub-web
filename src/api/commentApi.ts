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
const commentApi={
    // Lấy bình luận gốc của bài viết
    getTopLevelComments: (postId: string, page = 0, size = 5) =>
        axiosClient.get(`/api/posts/${postId}/comments?page=${page}&size=${size}`),

    // Lấy các câu trả lời (replies) của một bình luận
    getReplies: (parentId: string, page = 0, size = 5) =>
        axiosClient.get(`/api/posts/comments/${parentId}/replies?page=${page}&size=${size}`),

    // Tạo bình luận mới (gốc hoặc trả lời)
    createComment: (postId: string, data: CommentRequest) =>
        axiosClient.post(`/api/posts/${postId}/comments`, data),

    // Xóa bình luận
    deleteComment: (commentId: string) =>
        axiosClient.delete(`/api/posts/comments/${commentId}`),
}
export default commentApi;