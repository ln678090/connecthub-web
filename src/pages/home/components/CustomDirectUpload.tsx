import {useRef, useState} from "react";
import {Image as ImageIcon, Loader2, Video as VideoIcon} from "lucide-react";

import axiosClient from "../../../api/axiosClient.ts";
import axios from "axios";

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

        try {
            const paramsToSign = {
                folder: "connecthub"
            };

            // Dùng axiosClient nội bộ để gọi BE của bạn (cần JWT token)
            const signRes = await axiosClient.post("/api/cloudinary/signature", paramsToSign);

            // Xóa đi .data vì Axios trả về response nằm trong .data.data (tùy cấu trúc BE của bạn)
            // NẾU BE BẠN BỌC ApiResponse THÌ PHẢI LÀ signRes.data.data.signature
            // Ở đây mình theo sát code Controller bạn vừa gửi (ResponseEntity.ok):
            const signature = signRes.data.signature;
            const timestamp = signRes.data.timestamp; // Lúc này nó sẽ nhận được giá trị thực, không phải "undefined" nữa
            const apiKey = signRes.data.apiKey || import.meta.env.VITE_CLOUD_API_KEY;
            const cloudName = signRes.data.cloudName || import.meta.env.VITE_CLOUD_NAME;

            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', apiKey);
            formData.append('timestamp', timestamp);
            formData.append('signature', signature);
            formData.append('folder', "connecthub");

            const resourceType = file.type.startsWith('video/') ? 'video' : 'image';

            // QUAN TRỌNG: DÙNG AXIOS GỐC ĐỂ GỌI CLOUDINARY (để không bị dính Bearer Token làm lỗi CORS)
            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
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