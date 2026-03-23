import {Outlet} from 'react-router-dom';
import './App.css';
import {GlobalToasts} from "./components/Toast.tsx";

function App() {
    return (
        // Bạn có thể thêm Header (Navbar) hoặc Footer chung ở đây sau này
        // Ví dụ: {isAuthenticated && <Navbar />}
        <main className="min-h-screen bg-gray-50 text-gray-900">
            <Outlet />
            <GlobalToasts />
        </main>
    );
}

export default App;
