import {useFriendStore} from "../store/useFriendStore.ts";
import {useEffect, useRef, useState} from "react";
import {friendApi} from "../api/friendApi.ts";
import {Loader2, MoreHorizontal} from "lucide-react";
import {Link} from "react-router-dom";
import LeftSidebar from "./home/components/LeftSidebar.tsx";

export default function FriendsPage() {
    const { friends, isLoading, isFetchingMore, hasNext, fetchFriends, fetchMoreFriends, removeFriendFromList } = useFriendStore();
    const sentinelRef = useRef<HTMLDivElement>(null);

    // Fetch trang đầu tiên
    useEffect(() => {
        fetchFriends();
    }, [fetchFriends]);

    // Cuộn xuống để load thêm (Intersection Observer)
    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const observer = new IntersectionObserver((entry) => {
            if (entry[0].isIntersecting) fetchMoreFriends();
        }, { threshold: 0.1 });

        observer.observe(el);
        return () => observer.disconnect();
    }, [hasNext, fetchMoreFriends]);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <div className="hidden md:block">
                <LeftSidebar />
            </div>

            <main className="flex-1 px-4 py-6 md:px-6 lg:px-10">
                <div className="mx-auto max-w-[1000px]">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-6">Bạn bè của bạn</h1>

                        {isLoading ? (
                            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
                        ) : friends.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">Bạn chưa kết bạn với ai.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {friends.map((friend) => (
                                    <FriendCard
                                        key={friend.id}
                                        friend={friend}
                                        onUnfriend={() => removeFriendFromList(friend.id)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Sentinel để Trigger load more */}
                        <div ref={sentinelRef} className="h-4"></div>

                        {isFetchingMore && (
                            <div className="flex justify-center py-4"><Loader2 className="animate-spin text-blue-600" size={24} /></div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

// Component con: Thẻ bạn bè
function FriendCard({ friend, onUnfriend }: { friend: any, onUnfriend: () => void }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleUnfriend = async () => {
        if (!confirm(`Bạn có chắc chắn muốn hủy kết bạn với ${friend.fullName}?`)) return;
        try {
            await friendApi.unfriend(friend.id);
            onUnfriend(); // Xóa khỏi danh sách UI ngay lập tức
        } catch (error) {
            console.error("Lỗi hủy kết bạn", error);
        }
    };

    return (
        <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-md transition bg-white relative">
            <div className="flex items-center gap-4">
                <Link to={`/profile/${friend.id}`}>
                    <img
                        src={friend.avatarUrl || "https://via.placeholder.com/150"}
                        className="w-16 h-16 rounded-full object-cover border border-gray-200"
                        alt="avatar"
                    />
                </Link>
                <div>
                    <Link to={`/profile/${friend.id}`} className="font-bold text-gray-900 hover:underline">
                        {friend.fullName}
                    </Link>
                    <p className="text-sm text-gray-500 line-clamp-1">{friend.bio || "Thành viên ConnectHub"}</p>
                </div>
            </div>

            {/* Nút ba chấm (Menu sửa trạng thái/Hủy kết bạn) */}
            <div className="relative">
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition"
                >
                    <MoreHorizontal size={20} />
                </button>

                {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-lg py-1 z-50">
                        <button
                            onClick={handleUnfriend}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                        >
                            Hủy kết bạn
                        </button>
                    </div>
                )}

                {/* Overlay đóng menu */}
                {isMenuOpen && (
                    <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
                )}
            </div>
        </div>
    );
}