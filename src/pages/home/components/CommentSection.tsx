import {useEffect, useState} from "react";
import {useToastStore} from "../../../store/useToastStore.ts";
import commentApi, {type CommentResponse} from "../../../api/commentApi.ts";
import {MessageCircle, Send, Trash2} from "lucide-react";
import {useAuthStore} from "../../../store/useAuthStore.ts";



interface CommentProps {
    postId: string;
}

export default function CommentSection({postId}: CommentProps) {
    const [comments, setComments] = useState<CommentResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState('');
    const showToast = useToastStore((s) => s.show);
    useEffect(() => {
        fetchComments();
    }, [postId]);

    const fetchComments = async () => {
        setLoading(true);
        try {
            const res = await commentApi.getTopLevelComments(postId, 0, 10);
            // Data trả về từ PageImpl của Spring Data
            setComments(res.data.data.content);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
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
    return (
        <div className="mt-4 border-t border-gray-100 pt-4">
            {/* Form nhập bình luận gốc */}
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
                    <Send size={18}/>
                </button>
            </form>

            {/* Danh sách bình luận */}
            {loading ? (
                <div className="text-center text-sm text-gray-400">Đang tải...</div>
            ) : (
                <div className="flex flex-col gap-4">
                    {comments.map((comment, index) => (
                        <CommentItem
                            key={`comment-${comment.id}-${index}`}
                            comment={comment}
                            postId={postId}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// Component đệ quy cho từng Item
function CommentItem({comment, postId, onDelete}: {
    comment: CommentResponse;
    postId: string;
    onDelete: (id: string) => void;
}) {
    const [replies, setReplies] = useState<CommentResponse[]>([]);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [replyContent, setReplyContent] = useState('');

    // Dùng để lấy userId từ JWT Token trong Zustand (kiểm tra quyền Xóa)
    const currentUserId = useAuthStore((s) => s.user?.id); // Giả sử bạn có lưu user info

    const handleFetchReplies = async () => {
        if (showReplies) {
            setShowReplies(false);
            return;
        }
        try {
            const res = await commentApi.getReplies(comment.id, 0, 50);
            setReplies(res.data.data.content);
            setShowReplies(true);
        } catch (err) {
            console.error(err);
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
            setReplies([...replies, res.data.data]);
            setReplyContent('');
            setShowReplyForm(false);
            setShowReplies(true);
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
                {/* Bong bóng bình luận */}
                <div className="relative group rounded-2xl bg-gray-100 px-4 py-2 w-max max-w-full">
                    <p className="text-sm font-semibold text-gray-800">{comment.author.fullName}</p>
                    <p className="text-sm text-gray-700">{comment.content}</p>

                    {/* Nút xóa (chỉ hiện khi là chủ comment) */}
                    {(currentUserId === comment.author.id) && (
                        <button
                            onClick={() => onDelete(comment.id)}
                            className="absolute -right-8 top-2 hidden group-hover:block p-1 text-red-500 hover:bg-red-50 rounded-full"
                        >
                            <Trash2 size={14}/>
                        </button>
                    )}
                </div>

                {/* Hành động dưới bình luận */}
                <div className="mt-1 flex items-center gap-4 px-2 text-xs font-medium text-gray-500">
                    <button onClick={() => setShowReplyForm(!showReplyForm)}
                            className="hover:text-gray-800 transition">Phản hồi
                    </button>
                    <span>{new Date(comment.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>

                {/* Form nhập trả lời */}
                {showReplyForm && (
                    <form onSubmit={handlePostReply} className="mt-2 flex gap-2">
                        <input
                            autoFocus
                            type="text"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder={`Trả lời ${comment.author.fullName}...`}
                            className="flex-1 rounded-full bg-gray-50 border border-gray-200 px-3 py-1.5 text-xs focus:outline-none"
                        />
                        <button type="submit" disabled={!replyContent.trim()}
                                className="text-[#2e62a0] disabled:opacity-50">Gửi
                        </button>
                    </form>
                )}

                {/* Nút Xem câu trả lời */}
                {comment.replyCount > 0 && !showReplies && (
                    <button onClick={handleFetchReplies}
                            className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#2e62a0]">
                        <MessageCircle size={14}/> Xem {comment.replyCount} câu trả lời
                    </button>
                )}

                {/* Render danh sách replies */}
                {showReplies && (
                    <div className="mt-3 flex flex-col gap-3">
                        {replies.map((reply) => (
                            <div key={reply.id} className="flex gap-2">
                                <img src={reply.author.avatarUrl || "https://media.istockphoto.com/id/1196083861/vi/vec-to/b%E1%BB%99-bi%E1%BB%83u-t%C6%B0%E1%BB%A3ng-%C4%91%E1%BA%A7u-ng%C6%B0%E1%BB%9Di-%C4%91%C3%A0n-%C3%B4ng-%C4%91%C6%A1n-gi%E1%BA%A3n.jpg?s=612x612&w=0&k=20&c=7juGotIovn0c2KFGhZ_DcEqpfiSyYl-zz2ty9XYnYNs="}
                                     className="h-6 w-6 rounded-full"/>
                                <div>
                                    <div
                                        className="relative group rounded-2xl bg-gray-100 px-3 py-1.5 w-max max-w-full">
                                        <p className="text-xs font-semibold text-gray-800">{reply.author.fullName}</p>
                                        <p className="text-xs text-gray-700">{reply.content}</p>
                                        {(currentUserId === reply.author.id) && (
                                            <button onClick={() => handleReplyDelete(reply.id)}
                                                    className="absolute -right-8 top-1 hidden group-hover:block p-1 text-red-500">
                                                <Trash2 size={12}/>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}