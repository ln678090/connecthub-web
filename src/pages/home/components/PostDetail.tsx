import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { postApi, type PostDTO } from '../../../api/postApi';
import PostCard from './PostCard';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';

export default function PostDetail() {
    const { id: postId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<PostDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!postId) return;

        const fetchPostDetail = async () => {
            setIsLoading(true);
            try {
                // Giả sử postApi của bạn có hàm getPostById. Nếu chưa có, bạn cần thêm vào postApi.ts
                const resp = await postApi.getPostById(postId);
                setPost(resp.data.data);
            } catch (error) {
                console.error("Lỗi khi tải bài viết:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPostDetail();
    }, [postId]);

    const handleLike = async (id: string) => {
        // Cập nhật state nội bộ (Optimistic UI)
        if (post) {
            setPost({
                ...post,
                likedByMe: !post.likedByMe,
                likeCount: post.likedByMe ? post.likeCount - 1 : post.likeCount + 1
            });
        }
        try {
            await postApi.toggleLike(id);
        } catch (error) {
            // Nếu lỗi, rollback lại (tuỳ chọn)
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await postApi.deletePost(id);
            navigate('/'); // Xóa xong quay về trang chủ
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 animate-fade-in">
            {/* Cột trái */}
            <div className="hidden md:block">
                <LeftSidebar />
            </div>

            {/* Content ở giữa */}
            <main className="flex-1 px-4 py-6 md:px-6 lg:px-10">
                <div className="mx-auto max-w-[680px] flex flex-col gap-5">
                    {/* Nút quay lại */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#2e62a0] transition w-fit"
                    >
                        <ArrowLeft size={18} /> Quay lại
                    </button>

                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 size={32} className="animate-spin text-[#2e62a0]" />
                        </div>
                    ) : !post ? (
                        <div className="rounded-2xl bg-white p-10 text-center text-gray-500 shadow-sm">
                            Không tìm thấy bài viết hoặc bài viết đã bị xóa.
                        </div>
                    ) : (
                        <PostCard
                            postData={post}
                            onLike={handleLike}
                            onDelete={handleDelete}
                            defaultShowComments={true}
                        />
                    )}
                </div>
            </main>

            {/* Cột phải */}
            <div className="hidden xl:block py-6 pr-6">
                <RightSidebar />
            </div>
        </div>
    );
}