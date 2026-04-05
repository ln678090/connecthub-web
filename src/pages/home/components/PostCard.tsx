import React, { useState } from 'react';
import { Download, MessageCircle, MoreHorizontal, Share2, ThumbsUp, Trash2, X } from 'lucide-react';
import { useToastStore } from '../../../store/useToastStore';
import type { PostDTO } from '../../../api/postApi';
import { useAuthStore } from "../../../store/useAuthStore.ts";
import CommentSection from './CommentSection';
import { Link } from "react-router-dom";

interface PostCardProps {
    postData: PostDTO;
    onLike: (postId: string) => void;
    onDelete: (postId: string) => void;
    defaultShowComments?: boolean;
}

const PostCard = React.memo(({ postData, onLike, onDelete,defaultShowComments = false }: PostCardProps) => {
    // const [showComments, setShowComments] = useState(false);
    const [showComments, setShowComments] = useState(defaultShowComments);
    const [showMenu, setShowMenu] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);


    const showToast = useToastStore((s) => s.show);
    const currentUserId = useAuthStore((s) => s.user?.id);

    const handleDeletePost = async () => {
        if (!confirm("Bạn có chắc muốn xóa bài viết này? Hành động này sẽ xóa tất cả bình luận bên trong.")) return;
        try {
            // Gọi hàm onDelete được truyền từ Cha
            await onDelete(postData.id);
            showToast("Đã xóa bài viết thành công", "success");
        } catch (error) {
            showToast("Không thể xóa bài viết", "error");
        }
    };

    const handleLike = () => {
        // Gọi hàm onLike được truyền từ Cha
        onLike(postData.id);
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href)
            .then(() => showToast('Đã copy link bài viết!', 'success'))
            .catch(() => showToast('Không thể copy link', 'error'));
    };

    const isVideoUrl = (url: string) => {
        return url.match(/\.(mp4|webm|mov|ogg)$/i) != null || url.includes('/video/upload/');
    };

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const response = await fetch(postData.imageUrl!);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `connecthub-image-${postData.id}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            showToast('Lỗi khi tải ảnh!', 'error');
        }
    };

    return (
        <>
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 transition hover:shadow-md mt-4">
                {/* HEADER */}
                <div className="flex items-center justify-between px-5 pt-5">
                    <div className="flex items-center gap-3 mb-4">
                        <Link to={`/profile/${postData.authorId}`} className="block shrink-0 transition-transform hover:scale-105">
                            <img
                                src={postData.authorAvatar || 'https://res.cloudinary.com/dayoanitt/image/upload/v1774417116/davbhywnemftongrmdwx.jpg'}
                                alt={postData.authorName}
                                className="h-11 w-11 rounded-full object-cover ring-2 ring-[#2e62a0]/20"
                            />
                        </Link>

                        <div className="flex flex-col">
                            <Link
                                to={`/profile/${postData.authorId}`}
                                className="text-[15px] font-bold text-gray-900 hover:underline hover:text-[#2e62a0]"
                            >
                                {postData.authorName}
                            </Link>
                            <span className="text-xs text-gray-500">{postData.createdAt || "Vừa xong"}</span>
                        </div>
                    </div>

                    {/* MENU (3 CHẤM) */}
                    <div className="relative">
                        <button onClick={() => setShowMenu(!showMenu)} className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100">
                            <MoreHorizontal size={18} />
                        </button>
                        {showMenu && (
                            <div className="absolute right-0 top-full mt-1 w-32 rounded-xl bg-white shadow-lg border border-gray-100 overflow-hidden z-10">
                                {currentUserId === postData.authorId ? (
                                    <button onClick={handleDeletePost} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition">
                                        <Trash2 size={16} /> Xóa bài
                                    </button>
                                ) : (
                                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                        Báo cáo
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* CONTENT */}
                <p className="px-5 py-4 text-sm leading-relaxed text-gray-700">{postData.content}</p>

                {/* IMAGE/VIDEO */}
                {postData.imageUrl && (
                    <div className="mt-3 overflow-hidden border-y border-gray-50 bg-black">
                        {isVideoUrl(postData.imageUrl) ? (
                            <video src={postData.imageUrl} controls className="max-h-[500px] w-full object-contain" preload="metadata" />
                        ) : (
                            <img src={postData.imageUrl} alt="post" className="max-h-[500px] w-full object-contain bg-gray-50 cursor-zoom-in transition-transform hover:scale-[1.02]" onClick={() => setIsImageModalOpen(true)} />
                        )}
                    </div>
                )}

                {/* STATS */}
                <div className="flex items-center justify-between border-t border-gray-50 px-5 py-2 text-xs text-gray-400">
                    <span>{postData.likeCount} lượt thích</span>
                    <span>{postData.commentCount} bình luận</span>
                </div>

                {/* ACTIONS */}
                <div className="flex border-t border-gray-100 px-2 py-1">
                    {[
                        { icon: ThumbsUp, label: 'Thích', action: handleLike, active: postData.likedByMe, color: 'text-[#2e62a0]' },
                        { icon: MessageCircle, label: 'Bình luận', action: () => setShowComments(!showComments), active: showComments, color: 'text-[#71bc59]' },
                        { icon: Share2, label: 'Chia sẻ', action: handleShare, active: false, color: 'text-gray-500' },
                    ].map(({ icon: Icon, label, action, active, color }) => (
                        <button key={label} onClick={action} className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition hover:bg-gray-50 ${active ? color : 'text-gray-400'}`}>
                            <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                            {label}
                        </button>
                    ))}
                </div>

                {/* COMMENT SECTION */}
                {showComments && (
                    <div className="px-5 pb-5">
                        <CommentSection postId={postData.id} />
                    </div>
                )}
            </div>

            {/* MODAL ẢNH */}
            {isImageModalOpen && postData.imageUrl && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm transition-opacity" onClick={() => setIsImageModalOpen(false)}>
                    <button onClick={() => setIsImageModalOpen(false)} className="absolute right-4 top-4 z-10 rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white transition">
                        <X size={28} />
                    </button>
                    <button onClick={handleDownload} className="absolute right-16 top-4 z-10 rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white transition flex items-center gap-2" title="Tải ảnh về máy">
                        <Download size={24} />
                    </button>
                    <img src={postData.imageUrl} alt="Zoomed post" className="max-h-[90vh] max-w-[90vw] object-contain select-none cursor-zoom-out" onClick={(e) => e.stopPropagation()} />
                </div>
            )}
        </>
    );
});

export default PostCard;