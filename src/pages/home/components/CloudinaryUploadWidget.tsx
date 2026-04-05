import { useEffect, useRef } from "react";
import { Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import axios from "axios";

interface Props {
    onUploadSuccess: (url: string, fileType: 'image' | 'video') => void;
    children?: React.ReactNode;
    className?: string;
}

export default function CloudinaryUploadWidget({
                                                   onUploadSuccess,
                                                   children,
                                                   className
                                               }: Props) {
    const cloudinaryRef = useRef<any>(null);
    const widgetRef = useRef<any>(null);

    useEffect(() => {
        if (!("cloudinary" in window)) return;

        cloudinaryRef.current = (window as any).cloudinary;

        if (!import.meta.env.VITE_CLOUD_API_KEY) {
            alert("Lỗi: Frontend chưa nhận được VITE_CLOUD_API_KEY từ file .env");
            return;
        }
        widgetRef.current = cloudinaryRef.current.createUploadWidget(
            {
                cloudName: import.meta.env.VITE_CLOUD_NAME,
                apiKey: import.meta.env.VITE_CLOUD_API_KEY,
                uploadPreset: import.meta.env.VITE_CLOUD_UPLOAD_PRESET,
                multiple: false,
                sources: ["local"],
                defaultSource: "local",
                singleUploadAutoClose: true,
                showAdvancedOptions: false,
                cropping: false,
                clientAllowedFormats: ["jpg", "png", "jpeg", "mp4", "mov", "webm"],
                maxImageFileSize: 5000000,
                maxVideoFileSize: 50000000,
                // XÓA folder: "connecthub" ở đây đi vì đã cấu hình trong Preset rồi

                uploadSignature: async (callback: Function, paramsToSign: any) => {
                    try {
                        const res = await axios.post("/api/cloudinary/signature", paramsToSign);
                        callback(res.data.signature);
                    } catch (e) {
                        console.error("Không lấy được chữ ký Cloudinary", e);
                    }
                }
            },
            function (error: any, result: any) {
                if (!error && result && result.event === "success") {
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
                widgetRef.current?.open();
            }}
            className={
                className ||
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 transition-all hover:bg-blue-50 hover:text-[#2e62a0] border border-gray-100"
            }
        >
            {children ? children : (
                <>
                    <ImageIcon size={16} className="text-[#71bc59]" />
                    <span>/</span>
                    <VideoIcon size={16} className="text-rose-500" />
                    Ảnh/Video
                </>
            )}
        </button>
    );
}
