
import { Link } from 'react-router-dom';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import {useToastStore} from "../../../store/useToastStore.ts";
import {useEffect, useState} from "react";

import {friendApi, type UserSuggestion} from "../../../api/friendApi.ts";

export default function RightSidebar() {
    const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set());
    const showToast = useToastStore((s) => s.show);

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const res = await friendApi.getSuggestions();
                setSuggestions(res.data.data);
            } catch (error) {
                console.error("Lỗi tải gợi ý kết bạn:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSuggestions();
    }, []);

    const handleSendRequest = async (userId: string) => {
        try {
            // Optimistic update (Hiển thị đã gửi ngay lập tức)
            setRequestedIds((prev) => new Set(prev).add(userId));

            await friendApi.sendFriendRequest(userId);
            showToast("Đã gửi lời mời kết bạn", "success");
        } catch (error: any) {
            // Revert nếu lỗi
            setRequestedIds((prev) => {
                const next = new Set(prev);
                next.delete(userId);
                return next;
            });
            showToast(error.response?.data?.message || "Không thể gửi lời mời", "error");
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-6">
                <Loader2 className="animate-spin text-[#2e62a0]" />
            </div>
        );
    }

    if (suggestions.length === 0) {
        return null; // Không hiện gì nếu không có gợi ý
    }

    return (
        <div className="w-80 space-y-6">
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
                <h3 className="mb-4 text-base font-bold text-gray-900">Gợi ý kết bạn</h3>

                <div className="space-y-4">
                    {suggestions.map((user) => {
                        const isRequested = requestedIds.has(user.id);

                        return (
                            <div key={user.id} className="flex items-center justify-between gap-3">
                                <Link to={`/profile/${user.id}`} className="flex items-center gap-3 shrink-0">
                                    <img
                                        src={user.avatar || 'https://res.cloudinary.com/dayoanitt/image/upload/v1774417116/davbhywnemftongrmdwx.jpg'}
                                        alt={user.name}
                                        className="h-10 w-10 rounded-full object-cover ring-1 ring-gray-100"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-[14px] font-semibold text-gray-900 hover:text-[#2e62a0] hover:underline line-clamp-1">
                                            {user.name}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {user.mutualFriends > 0 ? `${user.mutualFriends} bạn chung` : 'Gợi ý cho bạn'}
                                        </span>
                                    </div>
                                </Link>

                                <button
                                    onClick={() => handleSendRequest(user.id)}
                                    disabled={isRequested}
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${
                                        isRequested
                                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                            : 'bg-[#2e62a0]/10 text-[#2e62a0] hover:bg-[#2e62a0] hover:text-white'
                                    }`}
                                    title={isRequested ? "Đã gửi lời mời" : "Thêm bạn bè"}
                                >
                                    {isRequested ? <UserCheck size={16} /> : <UserPlus size={16} />}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <button className="mt-5 w-full rounded-xl py-2.5 text-sm font-medium text-[#2e62a0] hover:bg-[#2e62a0]/5 transition">
                    Xem tất cả
                </button>
            </div>
        </div>
    );
}