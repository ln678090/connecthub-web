import {useEffect, useRef, useState} from "react";
import {useLocation, useParams} from "react-router-dom";

import {userApi} from "../../../api/userApi.ts";
import LeftSidebar from "../components/LeftSidebar";
import {useAuthStore} from "../../../store/useAuthStore.ts";
import {Camera, Download, Loader2, X} from "lucide-react";
import {usePostStore} from "../../../store/usePostStore.ts";
import PostCard from "./PostCard.tsx";
import {useToastStore} from "../../../store/useToastStore.ts";
import {friendApi} from "../../../api/friendApi.ts";

function PostSkeleton() {
    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 animate-pulse mt-4">
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
export default function Profile() {
    const urlUserId    = useParams<{ id: string }>().id;

    const [isFriendMenuOpen, setIsFriendMenuOpen] = useState(false);
    const currentUser = useAuthStore((state) => state.user);
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const userId = urlUserId || currentUser?.id;
    const isOwnProfile = currentUser?.id === userId;
    const showToast = useToastStore((s) => s.show);

    const [requestStatus, setRequestStatus] = useState<'NONE' | 'PENDING' | 'ACCEPTED'>('NONE');

    const handleSendFriendRequest = async () => {
        if (!userId) return;
        try {
            await friendApi.sendFriendRequest(userId);
            setProfile((prev:any) => prev ? { ...prev, friendshipStatus: 'REQUEST_SENT' } : prev);
        } catch (error) { console.error(error); }
    };

    const handleCancelFriendRequest = async () => {
        if (!userId) return;
        try {
            await friendApi.cancelRequest(userId);
            setProfile((prev:any) => prev ? { ...prev, friendshipStatus: 'NONE' } : prev);
        } catch (error) { console.error(error); }
    };

    const handleAcceptFriendRequest = async () => {
        if (!userId) return;
        try {
            await friendApi.acceptRequest(userId);
            setProfile((prev:any) => prev ? { ...prev, friendshipStatus: 'FRIENDS' } : prev);
        } catch (error) { console.error(error); }
    };

    const handleRejectFriendRequest = async () => {
        if (!userId) return;
        try {
            await friendApi.rejectRequest(userId);
            setProfile((prev:any) => prev ? { ...prev, friendshipStatus: 'NONE' } : prev);
        } catch (error) { console.error(error); }
    };

    const handleUnfriend = async () => {
        if (!userId) return;
        // if (!confirm("Bạn có chắc chắn muốn hủy kết bạn?")) return;
        setIsFriendMenuOpen(false);
        try {
            await friendApi.unfriend(userId);
            setProfile((prev:any) => prev ? { ...prev, friendshipStatus: 'NONE' } : prev);
        } catch (error) { console.error(error); }
    };
    const handleFollow = async () => {
        if (!userId) return;
        try {
            await userApi.followUser(userId);
            setProfile((prev: any) => prev ? { ...prev, isFollowing: true, followerCount: prev.followerCount + 1 } : prev);
        } catch (error) { console.error(error); }
    };

    const handleUnfollow = async () => {
        if (!userId) return;
        try {
            await userApi.unfollowUser(userId);
            setProfile((prev: any) => prev ? { ...prev, isFollowing: false, followerCount: prev.followerCount - 1 } : prev);
        } catch (error) { console.error(error); }
    };
    // Các Ref để chọc vào thẻ input file ẩn
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        fullName: "",
        bio: "",
        location: "",
        websiteUrl: ""
    });

    const [previewImage, setPreviewImage] = useState<{ url: string, type: 'avatar' | 'cover' | null }>({
        url: '',
        type: null
    });

    const [isSaving, setIsSaving] = useState(false);

    // post
    // --- Lấy dữ liệu của Profile thay vì Home ---
    const posts = usePostStore(s => s.profilePosts);
    const isPostsLoading = usePostStore(s => s.isProfileLoading);
    const isPostsLoadingMore = usePostStore(s => s.isProfileLoadingMore);
    const hasMorePosts = usePostStore(s => s.hasMoreProfilePosts);

    const location = useLocation();
    const fetchUserPosts = usePostStore(s => s.fetchUserPosts);
    const loadMoreUserPosts = usePostStore(s => s.loadMoreUserPosts);
    const toggleLikeProfilePost = usePostStore(s => s.toggleLikeProfilePost);
    const deleteProfilePost = usePostStore(s => s.deleteProfilePost);
    const resetProfilePosts = usePostStore(s => s.resetProfilePosts);

    const sentinelRef = useRef<HTMLDivElement>(null);

    // Effect fetch bài viết
    useEffect(() => {
        if (userId) {
            fetchUserPosts(userId);
        }
        return () => resetProfilePosts(); // Dọn dẹp state profile khi rời đi
    }, [userId, fetchUserPosts, resetProfilePosts]);

    // --- CÁC HÀM XỬ LÝ UPLOAD ẢNH NGẦM LÊN CLOUDINARY ---
    const uploadFileToCloudinary = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", import.meta.env.VITE_CLOUD_UPLOAD_PRESET);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUD_NAME}/image/upload`, {
            method: "POST",
            body: formData,
        });
        const data = await res.json();
        return data.secure_url;
    };

    const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setIsUploadingImage(true);
            const url = await uploadFileToCloudinary(file);
            await userApi.updateAvatar(url);
            setProfile({ ...profile, avatarUrl: url });
        } catch (error) {
            console.error("Lỗi upload avatar", error);
            alert("Lỗi khi tải ảnh đại diện lên!");
        } finally {
            setIsUploadingImage(false);
            if (avatarInputRef.current) avatarInputRef.current.value = '';
        }
    };

    const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setIsUploadingImage(true);
            const url = await uploadFileToCloudinary(file);
            await userApi.updateCover(url);
            setProfile({ ...profile, coverUrl: url });
        } catch (error) {
            console.error("Lỗi upload cover", error);
            alert("Lỗi khi tải ảnh bìa lên!");
        } finally {
            setIsUploadingImage(false);
            if (coverInputRef.current) coverInputRef.current.value = '';
        }
    };


    const handleOpenEditModal = () => {
        setEditForm({
            fullName: profile.fullName || "",
            bio: profile.bio || "",
            location: profile.location || "",
            websiteUrl: profile.websiteUrl || ""
        });
        setIsEditModalOpen(true);
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            await userApi.updateProfile({
                fullName: editForm.fullName,
                bio: editForm.bio,
                location: editForm.location,
                websiteUrl: editForm.websiteUrl
            });
            setProfile({
                ...profile,
                fullName: editForm.fullName,
                bio: editForm.bio,
                location: editForm.location,
                websiteUrl: editForm.websiteUrl,
            });
            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Lỗi khi cập nhật:", error);
            alert("Có lỗi xảy ra!");
        } finally {
            setIsSaving(false);
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        if (!userId) return;
        setIsLoading(true);
        userApi.getProfile(userId)
            .then((res) => setProfile(res.data.data))
            .catch((err) => console.error(err))
            .finally(() => setIsLoading(false));
        fetchUserPosts(userId);
        return () => {
            resetProfilePosts();
        };
    }, [userId, fetchUserPosts, resetProfilePosts, location.key]);


    const handleDownloadImage = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!previewImage.url) return;
        try {
            const response = await fetch(previewImage.url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `connecthub-${previewImage.type}-${userId}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert('Lỗi khi tải ảnh!');
        }
    };




    // Bắt sự kiện cuộn xuống (IntersectionObserver)
    useEffect(() => {
        const el = sentinelRef.current;
        if (!el || !userId) return;
        const observer = new IntersectionObserver((entry) => {
            if (entry[0].isIntersecting) {
                loadMoreUserPosts(userId);
            }
        }, { threshold: 0.1 });
        observer.observe(el);
        return () => observer.disconnect();
    }, [hasMorePosts, loadMoreUserPosts, userId]);
    if (isLoading) return <div className="p-10 text-center text-gray-500">Đang tải...</div>;
    if (!profile) return <div className="p-10 text-center text-red-500">Không tìm thấy người dùng!</div>;

    return (
        <div className="flex min-h-screen bg-gray-50 animate-fade-in">
            <div className="hidden md:block">
                <LeftSidebar/>
            </div>

            <main className="flex-1 px-4 py-6 md:px-6 lg:px-10">
                <div className="mx-auto max-w-[800px] flex flex-col gap-5">

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

                        {/* Khu vực Cover */}
                        <div className="relative h-64 sm:h-80 bg-gray-200 group">
                            <img
                                src={profile.coverUrl || "https://res.cloudinary.com/dayoanitt/image/upload/v1774417246/ydts7bqldo4rdl4izki8.jpg"}
                                alt="Cover"
                                className="w-full h-full object-cover cursor-zoom-in"
                                onClick={() => setPreviewImage({ url: profile.coverUrl, type: 'cover' })}
                            />
                        </div>

                        {/* Khu vực Avatar & Info */}
                        <div className="px-6 pb-6 relative">
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 mb-4 z-10 relative">

                                {/* Avatar */}
                                <div className="relative group w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white bg-white shadow-md">
                                    <img
                                        src={profile.avatarUrl || "https://res.cloudinary.com/dayoanitt/image/upload/v1774417116/davbhywnemftongrmdwx.jpg"}
                                        alt="Avatar"
                                        className="w-full h-full rounded-full object-cover cursor-zoom-in bg-white"
                                        onClick={() => setPreviewImage({ url: profile.avatarUrl, type: 'avatar' })}
                                    />
                                </div>


                                <div className="mt-4 flex gap-2">
                                    {/* Là chính mình */}
                                    {profile.friendshipStatus === 'SELF' && (
                                        <button className="px-4 py-2 bg-gray-100 rounded-lg">Chỉnh sửa thông tin</button>
                                    )}

                                    {/* Chưa kết bạn */}
                                    {profile.friendshipStatus === 'NONE' && (
                                        <button onClick={handleSendFriendRequest} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                            Thêm bạn bè
                                        </button>
                                    )}

                                    {/* Mình đã gửi yêu cầu -> Có thể hủy yêu cầu */}
                                    {profile.friendshipStatus === 'REQUEST_SENT' && (
                                        <button onClick={handleCancelFriendRequest} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                                            Hủy lời mời
                                        </button>
                                    )}

                                    {/* Người ta gửi cho mình -> Chấp nhận hoặc Từ chối */}
                                    {profile.friendshipStatus === 'REQUEST_RECEIVED' && (
                                        <>
                                            <button onClick={handleAcceptFriendRequest} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                                Chấp nhận
                                            </button>
                                            <button onClick={handleRejectFriendRequest} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                                                Từ chối
                                            </button>
                                        </>
                                    )}
                                    {!isOwnProfile && (
                                        profile.isFollowing ? (
                                            <button onClick={handleUnfollow} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium">
                                                Đang theo dõi
                                            </button>
                                        ) : (
                                            <button onClick={handleFollow} className="px-4 py-2 bg-[#2e62a0] text-white rounded-lg hover:bg-[#234c7d] font-medium">
                                                Theo dõi
                                            </button>
                                        )
                                    )}
                                    {/* Đã là bạn bè -> Có thể Hủy kết bạn */}
                                    {profile.friendshipStatus === 'FRIENDS' && (
                                        <div className="relative">
                                            {/* Nút Bạn bè */}
                                            <button
                                                onClick={() => setIsFriendMenuOpen(!isFriendMenuOpen)}
                                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium flex items-center gap-1"
                                            >
                                                ✓ Bạn bè
                                            </button>

                                            {/* Dropdown Menu (Hủy kết bạn) */}
                                            {isFriendMenuOpen && (
                                                <div className="absolute top-full mt-2 left-0 w-40 bg-white border border-gray-100 shadow-lg rounded-lg py-1 z-50">
                                                    <button
                                                        onClick={handleUnfriend}
                                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                    >
                                                        Hủy kết bạn
                                                    </button>
                                                </div>
                                            )}

                                            {/* Lớp phủ vô hình để đóng menu khi click ra ngoài */}
                                            {isFriendMenuOpen && (
                                                <div
                                                    className="fixed inset-0 z-40"
                                                    onClick={() => setIsFriendMenuOpen(false)}
                                                ></div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Thông tin Text */}
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{profile.fullName}</h1>
                                {profile.bio && <p className="text-gray-600 mt-2 whitespace-pre-wrap">{profile.bio}</p>}
                                <div className="flex gap-4 mt-3 text-sm text-gray-600">
                                    <span><strong className="text-gray-900">{profile.followerCount || 0}</strong> người theo dõi</span>
                                    <span><strong className="text-gray-900">{profile.followingCount || 0}</strong> đang theo dõi</span>
                                </div>
                            </div>
                        </div>

                        {/* Thanh Tabs */}
                        <div className="border-t border-gray-100 px-6 flex gap-8 text-gray-600 font-medium">
                            <button className="py-4 border-b-2 border-[#2e62a0] text-[#2e62a0]">Bài viết</button>
                            <button className="py-4 hover:text-gray-900 transition">Bạn bè</button>
                        </div>
                    </div>

                    {/* VÙNG CHỨA BÀI VIẾT */}
                    <div className="flex flex-col gap-4">
                        {isPostsLoading ? (
                            [1, 2, 3].map((i) => <PostSkeleton key={i} />)
                        ) : posts.length === 0 ? (
                            <div className="rounded-2xl bg-white p-8 text-center text-gray-500 shadow-sm mt-4">
                                {isOwnProfile ? "Bạn chưa có bài viết nào." : "Người dùng này chưa có bài viết nào."}
                            </div>
                        ) : (
                            posts.map((post, index) => (
                                <PostCard
                                    key={`${post.id}-${index}`}
                                    postData={post}
                                    onLike={toggleLikeProfilePost}
                                    onDelete={deleteProfilePost}
                                />
                            ))
                        )}

                        {/* Thẻ theo dõi cuộn */}
                        <div ref={sentinelRef} className="h-4"></div>

                        {isPostsLoadingMore && (
                            <div className="flex justify-center py-4">
                                <Loader2 size={24} className="animate-spin text-[#2e62a0]" />
                            </div>
                        )}

                        {!hasMorePosts && !isPostsLoading && posts.length > 0 && (
                            <p className="py-6 text-center text-sm text-gray-400">
                                Đã xem hết bài viết của người này!
                            </p>
                        )}
                    </div>
                </div>
            </main>

            {/* --- MODAL CHỈNH SỬA THÔNG TIN (CHỈ CÒN NHẬP TEXT, KO CÓ ĐỔI ẢNH NỮA) --- */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
                        {/* Header Modal */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 shrink-0">
                            <h2 className="text-xl font-bold text-gray-800">Chỉnh sửa thông tin</h2>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition"
                            >
                                <X size={20}/>
                            </button>
                        </div>

                        {/* Body Modal (Chỉ còn các trường nhập chữ) */}
                        <div className="p-6 space-y-5 overflow-y-auto flex-1">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Họ và tên</label>
                                <input type="text" name="fullName" value={editForm.fullName} onChange={handleFormChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e62a0]/50" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Tiểu sử (Bio)</label>
                                <textarea name="bio" value={editForm.bio} onChange={handleFormChange} placeholder="Viết vài dòng giới thiệu về bản thân..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e62a0]/50 min-h-[80px] resize-y" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Đến từ (Location)</label>
                                <input type="text" name="location" value={editForm.location} onChange={handleFormChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e62a0]/50" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Trang web</label>
                                <input type="text" name="websiteUrl" value={editForm.websiteUrl} onChange={handleFormChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e62a0]/50" />
                            </div>
                        </div>

                        {/* Footer Modal */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 shrink-0">
                            <button onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition">Hủy</button>
                            <button onClick={handleSaveProfile} disabled={isSaving} className="px-5 py-2.5 font-medium text-white bg-[#2e62a0] rounded-lg hover:bg-[#234c7d] transition disabled:opacity-70 flex items-center gap-2">
                                {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL XEM ẢNH VÀ ĐỔI ẢNH --- */}
            {previewImage.type && previewImage.url && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm transition-opacity"
                    onClick={() => setPreviewImage({ url: '', type: null })}
                >
                    <button onClick={() => setPreviewImage({ url: '', type: null })} className="absolute right-4 top-4 z-10 rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white transition">
                        <X size={28} />
                    </button>

                    <button onClick={handleDownloadImage} className="absolute right-16 top-4 z-10 rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white transition flex items-center gap-2" title="Tải ảnh về máy">
                        <Download size={28} />
                    </button>

                    <div className="relative flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={previewImage.url}
                            alt="Zoomed Profile Image"
                            className="max-h-[80vh] max-w-[90vw] object-contain select-none cursor-zoom-out shadow-2xl rounded-sm"
                        />

                        {/* Nút Đổi Ảnh lơ lửng bên dưới ảnh to (Chỉ hiện khi là profile của mình) */}
                        {isOwnProfile && (
                            <div className="absolute -bottom-16">
                                {previewImage.type === 'avatar' && (
                                    <>
                                        <input type="file" className="hidden" ref={avatarInputRef} accept="image/*" onChange={(e) => { handleAvatarFileChange(e); setPreviewImage({ url: '', type: null }); }} />
                                        <button
                                            onClick={() => avatarInputRef.current?.click()}
                                            disabled={isUploadingImage}
                                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-2.5 rounded-full transition cursor-pointer font-medium text-sm backdrop-blur-md"
                                        >
                                            {isUploadingImage ? <span className="animate-pulse">Đang tải lên...</span> : <><Camera size={18} /> Thay đổi ảnh đại diện</>}
                                        </button>
                                    </>
                                )}

                                {previewImage.type === 'cover' && (
                                    <>
                                        <input type="file" className="hidden" ref={coverInputRef} accept="image/*" onChange={(e) => { handleCoverFileChange(e); setPreviewImage({ url: '', type: null }); }} />
                                        <button
                                            onClick={() => coverInputRef.current?.click()}
                                            disabled={isUploadingImage}
                                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-2.5 rounded-full transition cursor-pointer font-medium text-sm backdrop-blur-md"
                                        >
                                            {isUploadingImage ? <span className="animate-pulse">Đang tải lên...</span> : <><Camera size={18} /> Thay đổi ảnh bìa</>}
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}