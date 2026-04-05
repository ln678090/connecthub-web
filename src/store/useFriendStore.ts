import {friendApi, type UserSuggestion} from "../api/friendApi.ts";
import {create} from "zustand";

interface FriendStore {
    friends: any[];
    isLoading: boolean;
    isFetchingMore: boolean;
    nextCursor: string | null;
    hasNext: boolean;
    fetchFriends: () => Promise<void>;
    fetchMoreFriends: () => Promise<void>;
    removeFriendFromList: (friendId: string) => void;
}

export const useFriendStore = create<FriendStore>((set, get) => ({
    friends: [],
    isLoading: false,
    isFetchingMore: false,
    nextCursor: null,
    hasNext: true,

    fetchFriends: async () => {
        set({ isLoading: true });
        try {
            const res = await friendApi.getFriends();
            set({
                friends: res.data.data.data,
                nextCursor: res.data.data.nextCursor,
                hasNext: res.data.data.hasNext,
                isLoading: false
            });
        } catch (error) { set({ isLoading: false }); }
    },

    fetchMoreFriends: async () => {
        const { isFetchingMore, hasNext, nextCursor, friends } = get();
        if (isFetchingMore || !hasNext || !nextCursor) return;

        set({ isFetchingMore: true });
        try {
            const res = await friendApi.getFriends(nextCursor);
            set({
                friends: [...friends, ...res.data.data.data],
                nextCursor: res.data.data.nextCursor,
                hasNext: res.data.data.hasNext,
                isFetchingMore: false
            });
        } catch (error) { set({ isFetchingMore: false }); }
    },

    removeFriendFromList: (friendId) => {
        set((state) => ({
            friends: state.friends.filter((f) => f.id !== friendId)
        }));
    }
}));