import {useEffect, useRef} from 'react';
import {Loader2} from 'lucide-react';
import PostCard from './components/PostCard';
import LeftSidebar from './components/LeftSidebar';
import StoryBar from './components/StoryBar';
import CreatePost from './components/CreatePost';
import RightSidebar from './components/RightSidebar';
import {usePostStore} from '../../store/usePostStore';

// Skeleton UI giữ nguyên...
function PostSkeleton() {
    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-full bg-gray-200"></div>
                <div className="flex flex-col gap-2">
                    <div className="h-3 w-32 rounded bg-gray-200"></div>
                    <div className="h-2 w-20 rounded bg-gray-100"></div>
                </div>
            </div>
            <div className="space-y-2 mb-4">
                <div className="h-3 w-full rounded bg-gray-200"></div>
                <div className="h-3 w-4/5 rounded bg-gray-200"></div>
            </div>
            <div className="h-48 w-full rounded-xl bg-gray-100"></div>
        </div>
    );
}

export default function HomePage() {
    // Lấy các state cần thiết (tách lẻ ra để an toàn)
    const posts = usePostStore(s => s.posts);
    const isLoading = usePostStore(s => s.isLoading);
    const isLoadingMore = usePostStore(s => s.isLoadingMore);
    const hasMore = usePostStore(s => s.hasMore);
    const fetchPosts = usePostStore(s => s.fetchPosts);
    const loadMore = usePostStore(s => s.loadMore);

    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const observer = new IntersectionObserver((entry) => {
            if (entry[0].isIntersecting) {
                loadMore();
            }
        }, { threshold: 0.1 });
        observer.observe(el);
        return () => observer.disconnect();
    }, [hasMore, loadMore]);

    // CHÚ Ý: Bỏ đoạn render Toast ở đây đi. Bỏ cái style inline animation đi
    return (
        <div className="flex min-h-screen bg-gray-50 animate-fade-in">
            <div className="hidden md:block">
                <LeftSidebar />
            </div>

            <main className="flex-1 px-4 py-6 md:px-6 lg:px-10">
                <div className="mx-auto max-w-[680px] flex flex-col gap-5">
                    <StoryBar />

                    {/* Component nhập liệu nằm cố định ở đây */}
                    <CreatePost />

                    {isLoading ? (
                        [1, 2, 3].map((i) => <PostSkeleton key={i} />)
                    ) : (
                        posts.map((post,index) => <PostCard key={`${post.id}-${index}`} postData={post} />)
                    )}

                    <div ref={sentinelRef} className="h-4"></div>

                    {isLoadingMore && (
                        <div className="flex justify-center py-4">
                            <Loader2 size={24} className="animate-spin text-[#2e62a0]" />
                        </div>
                    )}

                    {!hasMore && !isLoading && posts.length > 0 && (
                        <p className="py-6 text-center text-sm text-gray-400">
                            Bạn đã xem hết bài viết rồi!
                        </p>
                    )}
                </div>
            </main>

            <div className="hidden xl:block py-6 pr-6">
                <RightSidebar />
            </div>
        </div>
    );
}
