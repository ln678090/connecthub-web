import {useRef, useState} from "react";
import {Image as ImageIcon, Loader2, Video as VideoIcon} from "lucide-react";
import axios from 'axios';

interface Props {
    onUploadSuccess: (url: string, fileType: 'image' | 'video') => void;
}

export default function CustomDirectUpload({ onUploadSuccess }: Props) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', import.meta.env.VITE_CLOUD_UPLOAD_PRESET);

        try {
            const resourceType = file.type.startsWith('video/') ? 'video' : 'image';
            // Gọi thẳng API Cloudinary không qua Widget
            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUD_NAME}/${resourceType}/upload`,
                formData
            );

            onUploadSuccess(response.data.secure_url, resourceType);
        } catch (error) {
            console.error("Lỗi upload Cloudinary", error);
            alert("Upload thất bại!");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div>
            {/* Input file ẩn đi */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,video/*"
                className="hidden"
            />

            {/* Nút bấm tự thiết kế */}
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 transition-all hover:bg-blue-50 hover:text-[#2e62a0] border border-gray-100 disabled:opacity-50"
            >
                {isUploading ? (
                    <Loader2 size={16} className="animate-spin text-[#2e62a0]" />
                ) : (
                    <>
                        <ImageIcon size={16} className="text-[#71bc59]" />
                        <VideoIcon size={16} className="text-rose-500" />
                    </>
                )}
                {isUploading ? 'Đang tải...' : 'Ảnh/Video'}
            </button>
        </div>
    );
}
