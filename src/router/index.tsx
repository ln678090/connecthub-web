import {createBrowserRouter} from "react-router-dom";
import App from "../App.tsx";
import PublicRoute from "../guards/PublicRoute.tsx";
import {ProtectedRoute} from "../guards/ProtectedRoute.tsx";
import AuthPage from "../pages/auth/AuthPage.tsx";
import HomePage from "../pages/home/HomePage.tsx";
import Profile from "../pages/home/components/Profile.tsx";
import FriendsPage from "../pages/FriendsPage.tsx";
import Notification from "../pages/home/components/Notification.tsx";
import PostDetail from "../pages/home/components/PostDetail.tsx";

// type indexProps = {};

export const router =createBrowserRouter([
    {
        path:"/",
        element:<App/>, // App sẽ là Layout bọc ngoài cùng
        children:[
            //Chỉ dành cho khách chưa đăng nhập
            {
                element:<PublicRoute/>,
                children:[
                    {
                        path:"/login",
                        element:<AuthPage />
                    },
                    {
                        path:"/register",
                        element:<AuthPage />
                    }
                ],
            },
            //Chỉ dành cho khách đã đăng nhập
            {
                element:<ProtectedRoute/>,
                children:[
                    {
                        index: true, // index = true nghĩa là path '/'
                        element: <HomePage />,
                    },
                    {
                        path: "/profile/:id",
                        element: <Profile/>
                    },
                    {
                        path: "/profile",
                        element: <Profile/>
                    },
                    {
                        path: 'post/:id', element: <PostDetail />
                    },
                    {
                        path: "/friends",
                        element: <FriendsPage/>
                    },
                    {
                        path: "/notifications",
                        element: <Notification/>
                    }
                ]
            },
            // 404 Not Found
            {
                path: '*',
                element: <div className="flex h-screen items-center justify-center text-2xl font-bold">404 - Không tìm thấy trang</div>,
            },
        ]
    }
])
// export  router;

