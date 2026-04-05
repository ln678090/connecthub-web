import { postApi, type PostDTO } from "../api/postApi.ts";
import { create } from "zustand";

interface PostStore {
    // --- Dành cho Home Feed ---
    posts: PostDTO[];
    isLoading: boolean;
    isLoadingMore: boolean;
    hasMore: boolean;
    nextCursor: any;

    fetchPosts: () => Promise<void>;
    loadMore: () => Promise<void>;
    addPost: (post: PostDTO) => void;
    toggleLike: (postId: string) => Promise<void>;
    deletePost: (postId: string) => Promise<void>;

    // --- Dành riêng cho Profile ---
    profilePosts: PostDTO[];
    isProfileLoading: boolean;
    isProfileLoadingMore: boolean;
    hasMoreProfilePosts: boolean;
    profileNextCursor: any;

    fetchUserPosts: (userId: string) => Promise<void>;
    loadMoreUserPosts: (userId: string) => Promise<void>;
    toggleLikeProfilePost: (postId: string) => Promise<void>;
    deleteProfilePost: (postId: string) => Promise<void>;
    resetProfilePosts: () => void;
}

export const usePostStore = create<PostStore>((set, get) => ({
    // STATE CHO HOME
    posts: [],
    isLoading: false,
    isLoadingMore: false,
    hasMore: true,
    nextCursor: "",

    // STATE CHO PROFILE
    profilePosts: [],
    isProfileLoading: false,
    isProfileLoadingMore: false,
    hasMoreProfilePosts: true,
    profileNextCursor: "",

    // ---------------- HOME ACTIONS ----------------
    fetchPosts: async () => {
        set({ isLoading: true, nextCursor: "", hasMore: true });
        try {
            const resp = await postApi.getFeed("", 5);
            const { posts, nextCursor, hasNext } = resp.data.data;
            set({ posts, hasMore: hasNext, nextCursor: nextCursor || "" });
        } catch (_) {
            console.error("Lỗi khi fetch bài viết");
        } finally {
            set({ isLoading: false });
        }
    },

    loadMore: async () => {
        const { nextCursor, hasMore, isLoadingMore } = get();
        if (!hasMore || isLoadingMore) return;
        set({ isLoadingMore: true });
        try {
            const resp = await postApi.getFeed(nextCursor, 5);
            const { posts, nextCursor: newCursor, hasNext } = resp.data.data;
            set((s) => ({
                posts: [...s.posts, ...posts],
                hasMore: hasNext,
                nextCursor: newCursor || "",
            }));
        } catch (_) {
            console.error("Lỗi khi tải thêm bài viết");
        } finally {
            set({ isLoadingMore: false });
        }
    },

    addPost: (post) => set((s) => ({ posts: [post, ...s.posts] })),

    toggleLike: async (postId) => {
        set((s) => ({
            posts: s.posts.map((p) =>
                p.id === postId ? { ...p, likedByMe: !p.likedByMe, likeCount: p.likedByMe ? p.likeCount - 1 : p.likeCount + 1 } : p
            ),
        }));
        try {
            await postApi.toggleLike(postId);
        } catch (_) {
            // Revert nếu lỗi
            set((s) => ({
                posts: s.posts.map((p) =>
                    p.id === postId ? { ...p, likedByMe: !p.likedByMe, likeCount: p.likedByMe ? p.likeCount - 1 : p.likeCount + 1 } : p
                ),
            }));
        }
    },

    deletePost: async (postId: string) => {
        try {
            await postApi.deletePost(postId);
            set((s) => ({ posts: s.posts.filter((p) => p.id !== postId) }));
        } catch (error) {
            console.error("Lỗi khi xóa bài viết:", error);
            throw error;
        }
    },

    // ---------------- PROFILE ACTIONS ----------------
    resetProfilePosts: () => set({ profilePosts: [], isProfileLoading: false, hasMoreProfilePosts: true, profileNextCursor: "" }),

    fetchUserPosts: async (userId: string) => {
        set({ isProfileLoading: true, profileNextCursor: "", hasMoreProfilePosts: true, profilePosts: [] });
        try {
            const resp = await postApi.getUserPosts(userId, "", 5);
            const { posts, nextCursor, hasNext } = resp.data.data;
            set({
                profilePosts: posts,
                hasMoreProfilePosts: hasNext,
                profileNextCursor: nextCursor || ""
            });
        } catch (_) {
            console.error("Lỗi khi fetch bài viết của user");
        } finally {
            set({ isProfileLoading: false });
        }
    },

    loadMoreUserPosts: async (userId: string) => {
        const { profileNextCursor, hasMoreProfilePosts, isProfileLoadingMore } = get();
        if (!hasMoreProfilePosts || isProfileLoadingMore) return;

        set({ isProfileLoadingMore: true });
        try {
            const resp = await postApi.getUserPosts(userId, profileNextCursor, 5);
            const { posts, nextCursor: newCursor, hasNext } = resp.data.data;
            set((s) => ({
                profilePosts: [...s.profilePosts, ...posts],
                hasMoreProfilePosts: hasNext,
                profileNextCursor: newCursor || "",
            }));
        } catch (_) {
            console.error("Lỗi khi tải thêm bài viết của user");
        } finally {
            set({ isProfileLoadingMore: false });
        }
    },

    toggleLikeProfilePost: async (postId) => {
        set((s) => ({
            profilePosts: s.profilePosts.map((p) =>
                p.id === postId ? { ...p, likedByMe: !p.likedByMe, likeCount: p.likedByMe ? p.likeCount - 1 : p.likeCount + 1 } : p
            ),
        }));
        try {
            await postApi.toggleLike(postId);
        } catch (_) {
            set((s) => ({
                profilePosts: s.profilePosts.map((p) =>
                    p.id === postId ? { ...p, likedByMe: !p.likedByMe, likeCount: p.likedByMe ? p.likeCount - 1 : p.likeCount + 1 } : p
                ),
            }));
        }
    },

    deleteProfilePost: async (postId: string) => {
        try {
            await postApi.deletePost(postId);
            set((s) => ({ profilePosts: s.profilePosts.filter((p) => p.id !== postId) }));
        } catch (error) {
            console.error("Lỗi khi xóa bài viết:", error);
            throw error;
        }
    }
}));