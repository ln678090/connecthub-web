import {useRef, useState} from 'react';
import {X} from 'lucide-react';

import {usePostStore} from '../../../store/usePostStore';
import {postApi} from '../../../api/postApi';
import CustomDirectUpload from "./CustomDirectUpload.tsx";
// import CloudinaryUploadWidget from "./CloudinaryUploadWidget";

export default function CreatePost() {
    // 1. CHUYỂN TỪ useState SANG useRef CHO TEXT
    const textRef = useRef<HTMLTextAreaElement>(null);

    const [mediaUrl, setMediaUrl] = useState('');
    const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const addPost = usePostStore((s) => s.addPost);

    const handleUploadSuccess = (url: string, type: 'image' | 'video') => {
        setMediaUrl(url);
        setMediaType(type);
    };

    const handleSubmit = async () => {
        // Lấy giá trị trực tiếp từ DOM
        const currentText = textRef.current?.value || '';

        if (!currentText.trim() && !mediaUrl) return;
        setIsSubmitting(true);
        try {
            const resp = await postApi.createPost({
                content: currentText.trim(),
                imageUrl: mediaUrl || undefined,
            });
            addPost(resp.data.data);

            // Clear text sau khi đăng
            if (textRef.current) textRef.current.value = '';
            setMediaUrl('');
            setMediaType(null);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
            <div className="flex flex-col gap-3">
                {/* 2. BỎ HẲN VALUE VÀ ONCHANGE */}
                <textarea
                    ref={textRef}
                    defaultValue=""
                    placeholder="Bạn đang nghĩ gì thế?"
                    rows={3}
                    className="w-full resize-none rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#2e62a0]/30"
                />

                {mediaUrl && (
                    <div className="relative mt-2 overflow-hidden rounded-xl border border-gray-100">
                        <button
                            onClick={() => { setMediaUrl(''); setMediaType(null); }}
                            className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition"
                        >
                            <X size={16} />
                        </button>
                        {mediaType === 'video' || mediaUrl.includes('.mp4') ? (
                            <video src={mediaUrl} controls className="max-h-[300px] w-full bg-black object-contain" />
                        ) : (
                            <img src={mediaUrl} alt="preview" className="max-h-[300px] w-full object-contain bg-gray-50" />
                        )}
                    </div>
                )}

                <div className="mt-2 flex items-center justify-between">
                    <CustomDirectUpload onUploadSuccess={handleUploadSuccess} />
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="rounded-xl bg-gradient-to-r from-[#2e62a0] to-[#71bc59] px-6 py-2 text-sm font-bold text-white shadow-sm disabled:opacity-40 transition hover:opacity-90"
                    >
                        {isSubmitting ? 'Đang đăng...' : 'Đăng'}
                    </button>
                </div>
            </div>
        </div>
    );
}
