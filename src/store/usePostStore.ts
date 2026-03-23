import {postApi, type PostDTO} from "../api/postApi.ts";
import {create} from "zustand";

interface PostStore {
    posts: PostDTO[];
    isLoading: boolean;
    isLoadingMore: boolean;
    hasMore: boolean;
    nextCursor: string;

    fetchPosts: () => Promise<void>;
    loadMore: () => Promise<void>;
    addPost: (post: PostDTO) => void;
    toggleLike: (postId: string) => Promise<void>;
    deletePost: (postId: string) => Promise<void>;
}
export const usePostStore = create<PostStore>((set, get) => ({
    posts: [],
    isLoading: false,
    isLoadingMore: false,
    hasMore: true,
    nextCursor: "",

    fetchPosts: async () => {
        set({ isLoading: true, nextCursor: "", hasMore: true });
        try {
            // Truyền cursor rỗng để lấy dữ liệu mới nhất
            const resp = await postApi.getFeed("", 5);
            const { posts, nextCursor, hasNext } = resp.data.data;

            set({
                posts: posts,
                hasMore: hasNext,
                nextCursor: nextCursor || ""
            });
        } catch (_) {
            console.error("Lỗi khi fetch bài viết");
        } finally {
            set({ isLoading: false });
        }
    },

    loadMore: async () => {
        const { nextCursor, hasMore, isLoadingMore } = get();

        // Không cuộn tiếp nếu đang load hoặc hết dữ liệu
        if (!hasMore || isLoadingMore) return;

        set({ isLoadingMore: true });
        try {
            // Lấy thêm bài dựa vào con trỏ của bài cuối cùng
            const resp = await postApi.getFeed(nextCursor, 5);
            const { posts, nextCursor: newCursor, hasNext } = resp.data.data;

            set((s) => ({
                posts: [...s.posts, ...posts], // Nối mảng mới vào cuối mảng cũ
                hasMore: hasNext,
                nextCursor: newCursor || "",
            }));
        } catch (_) {
            console.error("Lỗi khi tải thêm bài viết");
        } finally {
            set({ isLoadingMore: false });
        }
    },
    addPost: (post) =>
        set((s) => ({ posts: [post, ...s.posts] })),

    // Optimistic update
    toggleLike: async (postId) => {
        set((s) => ({
            posts: s.posts.map((p) =>
                p.id === postId
                    ? { ...p, likedByMe: !p.likedByMe, likeCount: p.likedByMe ? p.likeCount - 1 : p.likeCount + 1 }
                    : p
            ),
        }));

        try {
            await postApi.toggleLike(postId);
        } catch (_) {
            set((s) => ({
                posts: s.posts.map((p) =>
                    p.id === postId
                        ? { ...p, likedByMe: !p.likedByMe, likeCount: p.likedByMe ? p.likeCount - 1 : p.likeCount + 1 }
                        : p
                ),
            }));
        }
    },

    deletePost: async (postId: string) => {
        try {
            await postApi.deletePost(postId);
            set((s) => ({
                posts: s.posts.filter((p) => p.id !== postId)
            }));
        } catch (error) {
            console.error("Lỗi khi xóa bài viết:", error);
            throw error;
        }
    },
}));