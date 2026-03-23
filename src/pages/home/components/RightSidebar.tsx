import {useEffect} from 'react';
import {Check, Loader2, UserPlus} from 'lucide-react';
import {useFriendStore} from '../../../store/useFriendStore';
import {useToastStore} from '../../../store/useToastStore';

const MOCK_ONLINE = [
    { id: 1, name: 'Minh Anh',  avatar: 'https://i.pravatar.cc/100?img=20' },
    { id: 2, name: 'Hải Đăng',  avatar: 'https://i.pravatar.cc/100?img=30' },
    { id: 3, name: 'Thu Trang', avatar: 'https://i.pravatar.cc/100?img=40' },
];

// Mock fallback khi API chưa có
const MOCK_SUGGESTIONS = [
    { id: 1, name: 'Nguyễn Hà My',  mutualFriends: 5, avatar: 'https://i.pravatar.cc/100?img=11' },
    { id: 2, name: 'Trần Văn Đức',  mutualFriends: 3, avatar: 'https://i.pravatar.cc/100?img=22' },
    { id: 3, name: 'Phạm Thị Hoa',  mutualFriends: 8, avatar: 'https://i.pravatar.cc/100?img=33' },
    { id: 4, name: 'Lê Quốc Toản',  mutualFriends: 2, avatar: 'https://i.pravatar.cc/100?img=44' },
];

export default function RightSidebar() {
    const { suggestions, sentIds, isLoading, fetchSuggestions, sendRequest } = useFriendStore();
    const showToast = useToastStore((s) => s.show);

    useEffect(() => {
        fetchSuggestions();
    }, []);

    const displayList = suggestions.length > 0 ? suggestions : MOCK_SUGGESTIONS;

    const handleSendRequest = async (userId: number, name: string) => {
        await sendRequest(userId);
        showToast(`Đã gửi lời mời đến ${name}! 👋`);
    };

    return (
        <aside className="flex w-72 flex-shrink-0 flex-col gap-6 sticky top-6">

            {/* GỢI Ý KẾT BẠN */}
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
                <h3 className="mb-4 text-sm font-semibold text-gray-700">Gợi ý kết bạn</h3>

                {isLoading ? (
                    <div className="flex justify-center py-4">
                        <Loader2 size={20} className="animate-spin text-[#2e62a0]" />
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {displayList.map((user) => {
                            const sent = sentIds.has(user.id);
                            return (
                                <div key={user.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <img src={user.avatar || 'https://media.istockphoto.com/id/1196083861/vi/vec-to/b%E1%BB%99-bi%E1%BB%83u-t%C6%B0%E1%BB%A3ng-%C4%91%E1%BA%A7u-ng%C6%B0%E1%BB%9Di-%C4%91%C3%A0n-%C3%B4ng-%C4%91%C6%A1n-gi%E1%BA%A3n.jpg?s=612x612&w=0&k=20&c=7juGotIovn0c2KFGhZ_DcEqpfiSyYl-zz2ty9XYnYNs='} alt={user.name}
                                             className="h-10 w-10 rounded-full object-cover" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">{user.name}</p>
                                            <p className="text-xs text-gray-400">{user.mutualFriends} bạn chung</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => !sent && handleSendRequest(user.id, user.name)}
                                        disabled={sent}
                                        className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                            sent
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-[#2e62a0]/10 text-[#2e62a0] hover:bg-[#2e62a0]/20'
                                        }`}
                                    >
                                        {sent
                                            ? <><Check size={13} /> Đã gửi</>
                                            : <><UserPlus size={13} /> Thêm</>
                                        }
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ĐANG ONLINE */}
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
                <h3 className="mb-4 text-sm font-semibold text-gray-700">Đang hoạt động</h3>
                <div className="flex flex-col gap-3">
                    {MOCK_ONLINE.map((user) => (
                        <div key={user.id}
                             className="flex cursor-pointer items-center gap-3 rounded-xl p-2 transition hover:bg-gray-50">
                            <div className="relative">
                                <img src={user.avatar} alt={user.name}
                                     className="h-9 w-9 rounded-full object-cover" />
                                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#71bc59] ring-2 ring-white" />
                            </div>
                            <p className="text-sm font-medium text-gray-700">{user.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
}
