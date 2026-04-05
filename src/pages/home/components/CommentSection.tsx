import {useEffect, useRef, useState} from "react";
import {useToastStore} from "../../../store/useToastStore.ts";
import commentApi, {type CommentResponse} from "../../../api/commentApi.ts";
import {Loader2, MessageCircle, Send, Trash2} from "lucide-react";
import {useAuthStore} from "../../../store/useAuthStore.ts";
import {useSearchParams} from "react-router-dom";



interface CommentProps {
    postId: string;
}

export default function CommentSection({postId}: CommentProps) {
    const [comments, setComments] = useState<CommentResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState('');
    const [loadingMore, setLoadingMore] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [hasNext, setHasNext] = useState(true);
    const sentinelRef = useRef<HTMLDivElement>(null);

    const [searchParams] = useSearchParams();
    const targetCommentId = searchParams.get('commentId');

    const showToast = useToastStore((s) => s.show);
    useEffect(() => {
        fetchComments();
    }, [postId,targetCommentId]);

    // const fetchComments = async () => {
    //     setLoading(true);
    //     try {
    //         // Gọi API không truyền cursor (tải trang đầu)
    //         const res = await commentApi.getTopLevelComments(postId, null, 10);
    //         const { data, nextCursor: newCursor, hasNext: newHasNext } = res.data.data;
    //
    //         setComments(data);
    //         setNextCursor(newCursor);
    //         setHasNext(newHasNext);
    //     } catch (err) {
    //         console.error(err);
    //     } finally {
    //         setLoading(false);
    //     }
    // };
    const fetchComments = async () => {
        setLoading(true);
        try {
            // 1. Tải trang đầu tiên như bình thường
            const res = await commentApi.getTopLevelComments(postId, null, 10);
            const { data, nextCursor: newCursor, hasNext: newHasNext } = res.data.data;

            let finalComments = [...data];

            // 2. NẾU CÓ TRUYỀN TARGET (TỪ THÔNG BÁO)
            if (targetCommentId) {
                // Kiểm tra xem comment mục tiêu có nằm trong trang 1 vừa tải không?
                const isTargetInFirstPage = finalComments.some(c => c.id === targetCommentId);

                // NẾU KHÔNG CÓ => Bị trôi xuống trang cũ rồi => Phải lôi cổ nó lên
                if (!isTargetInFirstPage) {
                    try {
                        const targetRes = await commentApi.getCommentById(targetCommentId);
                        const targetData = targetRes.data.data;

                        // Nếu comment mục tiêu là Comment Gốc (parentId = null)
                        if (!targetData.parentId) {
                            // Chèn lên đầu tiên luôn
                            finalComments = [targetData, ...finalComments];
                        }
                        // Nếu comment mục tiêu là một Reply (parentId != null)
                        else {
                            // Phải tìm cái thằng cha của nó lôi lên đầu
                            const parentRes = await commentApi.getCommentById(targetData.parentId);
                            const parentData = parentRes.data.data;
                            finalComments = [parentData, ...finalComments];
                        }
                    } catch (err) {
                        console.error("Không tìm thấy comment mục tiêu", err);
                    }
                }
            }

            setComments(finalComments);
            setNextCursor(newCursor);
            setHasNext(newHasNext);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    const loadMoreComments = async () => {
        if (!hasNext || !nextCursor || loadingMore) return;
        setLoadingMore(true);
        try {
            const res = await commentApi.getTopLevelComments(postId, nextCursor, 10);
            const { data, nextCursor: newCursor, hasNext: newHasNext } = res.data.data;

            // Nối bình luận cũ với bình luận mới tải thêm
            setComments((prev) => [...prev, ...data]);
            setNextCursor(newCursor);
            setHasNext(newHasNext);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingMore(false);
        }
    };
    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        try {
            const res = await commentApi.createComment(postId, {content, parentId: ''});
            // Thêm bình luận mới lên đầu danh sách
            setComments([res.data.data, ...comments]);
            setContent('');
        } catch (err) {
            showToast("Lỗi khi gửi bình luận", "error");
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!confirm("Bạn có chắc muốn xóa bình luận này?")) return;
        try {
            await commentApi.deleteComment(commentId);
            setComments((prev) => prev.filter((c) => c.id !== commentId));
            showToast("Đã xóa bình luận", "success");
        } catch (err) {
            showToast("Không có quyền xóa hoặc lỗi Server", "error");
        }
    };
    useEffect(() => {
        const el = sentinelRef.current;
        if (!el || !hasNext || loading || loadingMore) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                loadMoreComments();
            }
        }, { threshold: 0.1 });

        observer.observe(el);
        return () => observer.disconnect();
    }, [hasNext, loading, loadingMore, nextCursor]);
    return (
        <div className="mt-4 border-t border-gray-100 pt-4">
            <form onSubmit={handlePostComment} className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Viết bình luận..."
                    className="flex-1 rounded-full bg-gray-100 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2e62a0]/50"
                />
                <button
                    type="submit"
                    disabled={!content.trim()}
                    className="rounded-full bg-[#2e62a0] p-2 text-white disabled:opacity-50 transition hover:bg-[#1a4f8a]"
                >
                    <Send size={18} />
                </button>
            </form>

            {loading ? (
                <div className="flex justify-center py-4"><Loader2 className="animate-spin text-gray-400" size={20} /></div>
            ) : (
                <div className="flex flex-col gap-4">
                    {comments.map((comment, index) => (
                        <CommentItem
                            key={`comment-${comment.id}-${index}`}
                            comment={comment}
                            postId={postId}
                            onDelete={handleDelete}
                            targetCommentId={targetCommentId}
                        />
                    ))}

                    {/* Sentinel - Cảm biến cuộn thay cho nút Tải thêm */}
                    <div ref={sentinelRef} className="h-2"></div>

                    {loadingMore && (
                        <div className="flex justify-center py-2">
                            <Loader2 className="animate-spin text-gray-400" size={16} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
function CommentItem({
                         comment,
                         postId,
                         onDelete,
                         targetCommentId
                     }: {
    comment: CommentResponse;
    postId: string;
    onDelete: (id: string) => void;
    targetCommentId?: string | null;
}) {
    const [replies, setReplies] = useState<CommentResponse[]>([]);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [replyContent, setReplyContent] = useState('');

    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [hasNext, setHasNext] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const replySentinelRef = useRef<HTMLDivElement>(null);

    const currentUserId = useAuthStore((s) => s.user?.id);

    // State quản lý Highlight nền vàng
    const [isHighlighted, setIsHighlighted] = useState(false);
    const commentRef = useRef<HTMLDivElement>(null);

    // --- XỬ LÝ HIGHLIGHT VÀ AUTO SCROLL KHI LÀ TARGET ---
    useEffect(() => {
        if (targetCommentId === comment.id) {
            setIsHighlighted(true);

            // Đợi UI render ra DOM rồi mới cuộn tới
            setTimeout(() => {
                commentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);

            // Tắt highlight sau 3 giây
            const timer = setTimeout(() => {
                setIsHighlighted(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [targetCommentId, comment.id]);

    // Tự động kéo Replies nếu target nằm trong comment này
    useEffect(() => {
        // Nếu cái comment được target có parentId bằng với id của comment này
        // Tức là một trong các replies của comment này đang được target -> Tự động mở danh sách replies
        if (targetCommentId && comment.replyCount > 0 && !showReplies) {
            // Lý tưởng nhất là truyền xuống 1 state hoặc check param, nhưng ở đây
            // cứ load 1 lần lấy trang đầu tiên, nếu có mục tiêu bên trong thì tự open
            handleFetchReplies(true);
        }
    }, [targetCommentId, comment.id, comment.replyCount]);

    const handleFetchReplies = async (autoOpenTarget = false) => {
        if (showReplies && !autoOpenTarget) {
            setShowReplies(false);
            return;
        }
        try {
            const res = await commentApi.getReplies(comment.id, null, 5);
            const { data, nextCursor: newCursor, hasNext: newHasNext } = res.data.data;

            let loadedReplies = [...data];

            // NẾU CÓ TARGET REPLY: nhồi nó lên đầu nếu nó chưa nằm trong 5 cái đầu tiên
            if (autoOpenTarget && targetCommentId) {
                const alreadyExists = loadedReplies.find((r) => r.id === targetCommentId);
                if (!alreadyExists) {
                    try {
                        const targetRes = await commentApi.getCommentById!(targetCommentId);
                        // Chỉ thêm vào nếu nó thực sự thuộc về comment cha này
                        if (targetRes.data.data.parentId === comment.id) {
                            loadedReplies = [targetRes.data.data, ...loadedReplies];
                        }
                    } catch (err) {
                        console.error("Lỗi load target reply", err);
                    }
                }
            }

            setReplies(loadedReplies);
            setNextCursor(newCursor);
            setHasNext(newHasNext);
            setShowReplies(true);
        } catch (err) {
            console.error(err);
        }
    };

    // Bắt sự kiện cuộn xuống cuối danh sách phản hồi
    useEffect(() => {
        const el = replySentinelRef.current;
        if (!el || !hasNext || !showReplies || loadingMore) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                loadMoreReplies();
            }
        }, { threshold: 0.1 });

        observer.observe(el);
        return () => observer.disconnect();
    }, [hasNext, showReplies, loadingMore, nextCursor]);

    const loadMoreReplies = async () => {
        if (!hasNext || !nextCursor || loadingMore) return;
        setLoadingMore(true);
        try {
            const res = await commentApi.getReplies(comment.id, nextCursor, 5);
            const { data, nextCursor: newCursor, hasNext: newHasNext } = res.data.data;
            setReplies((prev) => [...prev, ...data]);
            setNextCursor(newCursor);
            setHasNext(newHasNext);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingMore(false);
        }
    };

    const handlePostReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        try {
            const res = await commentApi.createComment(postId, {
                content: replyContent,
                parentId: comment.id
            });
            setReplies([res.data.data, ...replies]); // Đẩy phản hồi mới lên đầu
            setReplyContent('');
            setShowReplyForm(false);
            setShowReplies(true); // Gửi xong thì phải mở list lên cho ng ta xem
        } catch (err) {
            console.error(err);
        }
    };

    const handleReplyDelete = async (replyId: string) => {
        if (!confirm("Bạn có chắc muốn xóa phản hồi này?")) return;
        try {
            await commentApi.deleteComment(replyId);
            setReplies((prev) => prev.filter((r) => r.id !== replyId));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex gap-3">
            <img src={comment.author.avatarUrl || "https://media.istockphoto.com/id/1196083861/vi/vec-to/b%E1%BB%99-bi%E1%BB%83u-t%C6%B0%E1%BB%A3ng-%C4%91%E1%BA%A7u-ng%C6%B0%E1%BB%9Di-%C4%91%C3%A0n-%C3%B4ng-%C4%91%C6%A1n-gi%E1%BA%A3n.jpg?s=612x612&w=0&k=20&c=7juGotIovn0c2KFGhZ_DcEqpfiSyYl-zz2ty9XYnYNs="} alt=""
                 className="h-8 w-8 rounded-full object-cover"/>
            <div className="flex-1">

                {/* COMMENT GỐC */}
                <div
                    ref={commentRef}
                    className={`relative group rounded-2xl px-4 py-2 w-max max-w-full transition-all duration-700 ${
                        isHighlighted
                            ? 'bg-yellow-100 ring-2 ring-yellow-400 shadow-md scale-[1.02] z-10' 
                            : 'bg-gray-100'
                    }`}
                >
                    <p className="text-sm font-semibold text-gray-800">{comment.author.fullName}</p>
                    <p className="text-sm text-gray-700">{comment.content}</p>

                    {(currentUserId === comment.author.id) && (
                        <button
                            onClick={() => onDelete(comment.id)}
                            className="absolute -right-8 top-2 hidden group-hover:block p-1 text-red-500 hover:bg-red-50 rounded-full"
                        >
                            <Trash2 size={14}/>
                        </button>
                    )}
                </div>

                {/* HÀNH ĐỘNG DƯỚI COMMENT GỐC */}
                <div className="mt-1 flex items-center gap-4 px-2 text-xs font-medium text-gray-500">
                    <button onClick={() => setShowReplyForm(!showReplyForm)}
                            className="hover:text-gray-800 transition">Phản hồi
                    </button>
                    <span>{new Date(comment.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>

                {showReplyForm && (
                    <form onSubmit={handlePostReply} className="mt-2 flex gap-2">
                        <input
                            autoFocus
                            type="text"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder={`Trả lời ${comment.author.fullName}...`}
                            className="flex-1 rounded-full bg-gray-50 border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#2e62a0]/30"
                        />
                        <button type="submit" disabled={!replyContent.trim()}
                                className="text-[#2e62a0] disabled:opacity-50 hover:text-[#1a4f8a] font-medium">Gửi
                        </button>
                    </form>
                )}

                {comment.replyCount > 0 && !showReplies && (
                    <button onClick={() => handleFetchReplies(false)}
                            className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#2e62a0] hover:underline">
                        <MessageCircle size={14}/> Xem {comment.replyCount} câu trả lời
                    </button>
                )}

                {showReplies && (
                    <div className="mt-3 flex flex-col gap-3">
                        {replies.map((reply) => {
                            // Xử lý Highlight riêng cho từng Reply
                            const isReplyHighlighted = targetCommentId === reply.id;

                            return (
                                <div key={reply.id} className="flex gap-2">
                                    <img src={reply.author.avatarUrl || "https://media.istockphoto.com/id/1196083861/vi/vec-to/b%E1%BB%99-bi%E1%BB%83u-t%C6%B0%E1%BB%A3ng-%C4%91%E1%BA%A7u-ng%C6%B0%E1%BB%9Di-%C4%91%C3%A0n-%C3%B4ng-%C4%91%C6%A1n-gi%E1%BA%A3n.jpg?s=612x612&w=0&k=20&c=7juGotIovn0c2KFGhZ_DcEqpfiSyYl-zz2ty9XYnYNs="}
                                         className="h-6 w-6 rounded-full"/>
                                    <div>
                                        <div
                                            ref={(el) => {
                                                if (el && isReplyHighlighted && !el.dataset.scrolled) {
                                                    el.dataset.scrolled = "true";
                                                    setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center'}), 300);
                                                }
                                            }}
                                            className={`relative group rounded-2xl px-3 py-1.5 w-max max-w-full transition-all duration-700 ${
                                                isReplyHighlighted
                                                    ? 'bg-blue-100 ring-2 ring-blue-400 shadow-md scale-[1.02] z-10' // <--- Hiệu ứng xịn hơn
                                                    : 'bg-gray-100'
                                            }`}
                                        >
                                            <p className="text-xs font-semibold text-gray-800">{reply.author.fullName}</p>
                                            <p className="text-xs text-gray-700">{reply.content}</p>
                                            {(currentUserId === reply.author.id) && (
                                                <button onClick={() => handleReplyDelete(reply.id)}
                                                        className="absolute -right-8 top-1 hidden group-hover:block p-1 text-red-500 hover:bg-red-50 rounded-full">
                                                    <Trash2 size={12}/>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Sentinel - Cảm biến cuộn cho Phản hồi */}
                        <div ref={replySentinelRef} className="h-1"></div>

                        {loadingMore && (
                            <div className="text-xs text-gray-400 pl-2 flex items-center gap-1">
                                <Loader2 className="animate-spin" size={12}/> Đang tải...
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
