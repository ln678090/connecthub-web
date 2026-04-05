import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../../../store/useNotificationStore';

export default function Notification() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const {
        notifications, unreadCount, isLoading, isLoadingMore, hasNext,
        fetchNotifications, loadMore, markAsRead, markAllAsRead
    } = useNotificationStore();

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // useEffect(() => {
    //     if (isOpen && notifications.length === 0) fetchNotifications();
    // }, [isOpen]);
    useEffect(() => {
        // Cứ hễ bấm MỞ dropdown là load list mới nhất từ server về
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen, fetchNotifications]);
    useEffect(() => {
        const el = sentinelRef.current;
        if (!el || !isOpen) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) loadMore();
        }, { threshold: 0.1 });

        observer.observe(el);
        return () => observer.disconnect();
    }, [hasNext, isOpen, loadMore]);

    const getNotificationText = (n: any) => {
        const name = n.actor?.fullName || 'Ai đó';
        const others = n.actorCount > 1 ? ` và ${n.actorCount - 1} người khác` : '';

        switch (n.type) {
            case 'LIKE_POST': return <span><b>{name}</b>{others} đã thích bài viết của bạn.</span>;
            case 'COMMENT_POST': return <span><b>{name}</b>{others} đã bình luận về bài viết của bạn.</span>;
            case 'COMMENT_COMMENT_POST': return <span><b>{name}</b>{others} đã phản hồi bình luận của bạn.</span>;
            case 'FOLLOW': return <span><b>{name}</b> đã bắt đầu theo dõi bạn.</span>;
            case 'ADD_FRIEND': return <span><b>{name}</b> đã gửi cho bạn lời mời kết bạn.</span>;
            case 'ACCEPT_FRIEND': return <span><b>{name}</b> đã chấp nhận lời mời kết bạn của bạn.</span>;
            default: return <span><b>{name}</b> đã tương tác với bạn.</span>;
        }
    };

    // const handleClickItem = async (n: any) => {
    //     if (!n.isRead) await markAsRead(n.id);
    //     setIsOpen(false);
    //
    //     if (['ADD_FRIEND', 'ACCEPT_FRIEND', 'FOLLOW'].includes(n.type)) {
    //         navigate(`/profile/${n.referenceId}`);
    //     } else {
    //         navigate(`/post/${n.referenceId}`);
    //     }
    // };
    const handleClickItem = async (n: any) => {
        // Đánh dấu đã đọc trước
        if (!n.isRead) await markAsRead(n.id);

        // Đóng menu thông báo
        setIsOpen(false);

        // Chuẩn bị biến để tách ID
        let targetPostId = n.referenceId;
        let targetCommentId = null;

        // Nếu referenceId có chứa dấu "_", tiến hành cắt đôi chuỗi
        if (n.referenceId && n.referenceId.includes('_')) {
            const parts = n.referenceId.split('_');
            targetPostId = parts[0];     // Nửa đầu là postId
            targetCommentId = parts[1];  // Nửa sau là commentId
        }

        // Chuyển hướng
        if (['ADD_FRIEND', 'ACCEPT_FRIEND', 'FOLLOW'].includes(n.type)) {
            navigate(`/profile/${targetPostId}`); // Mấy cái này referenceId là userId
        } else if (['COMMENT_POST', 'COMMENT_COMMENT_POST'].includes(n.type)) {
            // Nếu cắt ra được targetCommentId thì gắn vào URL
            if (targetCommentId) {
                navigate(`/post/${targetPostId}?commentId=${targetCommentId}`);
            } else {
                navigate(`/post/${targetPostId}`);
            }
        } else {
            // Các trường hợp LIKE_POST...
            navigate(`/post/${targetPostId}`);
        }
    };
    return (
        <div className="relative w-full" ref={dropdownRef}>
            {/* Button thiết kế khớp với Sidebar Item */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isOpen || unreadCount > 0
                        ? 'bg-gradient-to-r from-[#2e62a0]/10 to-[#71bc59]/10 text-[#2e62a0] font-semibold'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
            >
                <div className="relative flex items-center justify-center">
                    <Bell
                        size={20}
                        className={isOpen || unreadCount > 0 ? 'text-[#2e62a0]' : 'text-gray-400'}
                        strokeWidth={isOpen || unreadCount > 0 ? 2.5 : 2}
                    />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </div>
                Thông báo
                {isOpen && <span className="ml-auto h-2 w-2 rounded-full bg-[#2e62a0]" />}
            </button>

            {/* SỬA CHỖ NÀY: Dùng left-full để đẩy Panel sang phải nút, không bị tràn màn hình */}
            {isOpen && (
                <div className="absolute left-full top-0 ml-3 w-80 sm:w-96 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden z-[100] animate-fade-in flex flex-col max-h-[80vh]">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 shrink-0 bg-white z-10">
                        <h3 className="font-bold text-gray-800">Thông báo</h3>
                        {unreadCount > 0 && (
                            <button onClick={markAllAsRead} className="text-xs text-[#2e62a0] hover:text-[#71bc59] font-semibold flex items-center gap-1">
                                <CheckCheck size={14} />
                                Đánh dấu đã đọc
                            </button>
                        )}
                    </div>

                    <div className="overflow-y-auto flex-1 bg-gray-50/50 relative custom-scrollbar">
                        {isLoading ? (
                            <div className="flex justify-center p-6"><Loader2 className="animate-spin text-[#2e62a0]" /></div>
                        ) : notifications.length === 0 ? (
                            <div className="text-center p-6 text-gray-500 text-sm">Bạn chưa có thông báo nào.</div>
                        ) : (
                            <div className="flex flex-col">
                                {notifications.map(n => (
                                    <div
                                        key={n.id}
                                        onClick={() => handleClickItem(n)}
                                        className={`flex gap-3 p-4 cursor-pointer transition hover:bg-gray-100 border-b border-gray-50/50 ${!n.isRead ? 'bg-[#2e62a0]/5' : 'bg-white'}`}
                                    >
                                        <img src={n.actor?.avatarUrl} alt="Avatar" className="w-11 h-11 rounded-full object-cover shrink-0 border border-gray-100" />
                                        <div className="flex-1 flex flex-col gap-1">
                                            <p className={`text-[13px] text-gray-800 ${!n.isRead ? 'font-medium' : ''}`}>
                                                {getNotificationText(n)}
                                            </p>
                                            <span className={`text-[11px] ${!n.isRead ? 'text-[#2e62a0] font-semibold' : 'text-gray-400'}`}>
                                                {new Date(n.updatedAt).toLocaleString('vi-VN', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                                            </span>
                                        </div>
                                        {!n.isRead && <div className="w-2 h-2 rounded-full bg-[#2e62a0] mt-1.5 shrink-0 shadow-sm"></div>}
                                    </div>
                                ))}
                                <div ref={sentinelRef} className="h-4 w-full"></div>
                                {isLoadingMore && <div className="flex justify-center p-2"><Loader2 className="animate-spin text-[#2e62a0] size-4" /></div>}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}