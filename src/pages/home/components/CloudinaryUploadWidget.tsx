import {useEffect, useRef} from "react";
import {Image as ImageIcon, Video as VideoIcon} from "lucide-react";

interface Props {
    onUploadSuccess: (url: string, fileType: 'image' | 'video') => void;
}

export default function CloudinaryUploadWidget({ onUploadSuccess }: Props) {
    const cloudinaryRef = useRef<any>();
    const widgetRef = useRef<any>();

    useEffect(() => {
        if (!('cloudinary' in window)) return;

        cloudinaryRef.current = (window as any).cloudinary;

        widgetRef.current = cloudinaryRef.current.createUploadWidget(
            {
                cloudName: import.meta.env.VITE_CLOUD_NAME,
                uploadPreset: import.meta.env.VITE_CLOUD_UPLOAD_PRESET,
                clientAllowedFormats: ['images', 'video', 'jpg', 'png', 'jpeg', 'mp4', 'mov', 'webm'],
                maxImageFileSize: 5000000,
                maxVideoFileSize: 50000000,
                multiple: false,

                // --- PHÉP MÀU NẰM Ở 3 DÒNG NÀY ---
                sources: ['local'], // Chỉ lấy file từ máy tính, dẹp sạch URL, Camera, Drive...
                defaultSource: 'local', // Ép vào luôn local
                singleUploadAutoClose: true, // Up xong 1 file thì tự đóng cái vèo
                showAdvancedOptions: false,
                cropping: false,
                // Chỉnh css tàng hình nhất có thể để nếu nó lỡ xẹt qua thì cũng không xấu
                styles: {
                    palette: {
                        window: "#ffffff", windowBorder: "#ffffff",
                        tabIcon: "#2e62a0", menuIcons: "#2e62a0", textDark: "#000000",
                        textLight: "#ffffff", link: "#2e62a0", action: "#2e62a0",
                        inactiveTabIcon: "#000000", error: "#ff0000", inProgress: "#2e62a0",
                        complete: "#71bc59", sourceBg: "#ffffff"
                    },
                }
            },
            function (error: any, result: any) {
                if (!error && result && result.event === 'success') {
                    onUploadSuccess(result.info.secure_url, result.info.resource_type);
                }
            }
        );
    }, [onUploadSuccess]);

    return (
        <button
            type="button"
            onClick={(e) => {
                e.preventDefault();
                if (widgetRef.current) widgetRef.current.open();
            }}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 transition-all hover:bg-blue-50 hover:text-[#2e62a0] border border-gray-100"
        >
            <ImageIcon size={16} className="text-[#71bc59]" />
            <VideoIcon size={16} className="text-rose-500" />
            Ảnh/Video
        </button>
    );
}
