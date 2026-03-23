type StoryBarProps = {};
const stories = [
    { id: 1, name: 'Bạn',       avatar: 'https://i.pravatar.cc/100?img=10', isOwn: true },
    { id: 2, name: 'Minh Anh',  avatar: 'https://i.pravatar.cc/100?img=20', isOwn: false },
    { id: 3, name: 'Hải Đăng',  avatar: 'https://i.pravatar.cc/100?img=30', isOwn: false },
    { id: 4, name: 'Thu Trang',  avatar: 'https://i.pravatar.cc/100?img=40', isOwn: false },
    { id: 5, name: 'Quốc Bảo',  avatar: 'https://i.pravatar.cc/100?img=50', isOwn: false },
    { id: 6, name: 'Lan Nhi',   avatar: 'https://i.pravatar.cc/100?img=60', isOwn: false },
];
export default function StoryBar({}: StoryBarProps) {
    return (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {stories.map((story) => (
                <div
                    key={story.id}
                    className="flex flex-shrink-0 cursor-pointer flex-col items-center gap-2 group"
                >
                    <div
                        className={`relative h-16 w-16 rounded-2xl overflow-hidden ring-2 ring-offset-2 transition group-hover:scale-105 ${
                            story.isOwn ? 'ring-gray-300' : 'ring-[#2e62a0]'
                        }`}
                    >
                        <img
                            src={story.avatar}
                            alt={story.name}
                            className="h-full w-full object-cover"
                        />
                        {story.isOwn && (
                            <div className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#2e62a0] to-[#71bc59] text-white text-xs font-bold shadow">
                                +
                            </div>
                        )}
                    </div>
                    <span className="text-xs font-medium text-gray-600 truncate w-16 text-center">
            {story.isOwn ? 'Thêm story' : story.name}
          </span>
                </div>
            ))}
        </div>
    );
}