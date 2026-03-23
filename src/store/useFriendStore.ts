import {friendApi, type UserSuggestion} from "../api/friendApi.ts";
import {create} from "zustand";

interface FriendStore {
    suggestions: UserSuggestion[];
    sentIds: Set<number>;   // ID đã gửi request
    isLoading: boolean;

    fetchSuggestions: () => Promise<void>;
    sendRequest: (userId: number) => Promise<void>;
}

export const useFriendStore = create<FriendStore>((set) => ({
    suggestions: [],
    sentIds: new Set(),
    isLoading: false,

    fetchSuggestions: async () => {
        set({ isLoading: true });
        try {
            const resp = await friendApi.getSuggestions();
            set({ suggestions: resp.data.data });
        } catch (_) {}
        finally { set({ isLoading: false }); }
    },

    sendRequest: async (userId) => {
        // Optimistic: đánh dấu đã gửi ngay
        set((s) => ({ sentIds: new Set([...s.sentIds, userId]) }));
        try {
            await friendApi.sendRequest(userId);
        } catch (_) {
            // Rollback
            set((s) => {
                const next = new Set(s.sentIds);
                next.delete(userId);
                return { sentIds: next };
            });
        }
    },
}));