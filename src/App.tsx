import { Outlet } from 'react-router-dom';
import './App.css';
import { GlobalToasts } from "./components/Toast.tsx";
import { useNotificationStore } from "./store/useNotificationStore.ts";
import { useEffect } from "react";
import { useAuthStore } from "./store/useAuthStore.ts";

function App() {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const isInitialized = useAuthStore(state => state.isInitialized);

    const startPolling = useNotificationStore((state) => state.startPolling);
    const stopPolling = useNotificationStore((state) => state.stopPolling);

    useEffect(() => {
        if (isInitialized && isAuthenticated) {
            startPolling();
        } else {
            stopPolling();
        }

        return () => {
            stopPolling();
        };
    }, [isInitialized, isAuthenticated, startPolling, stopPolling]);

    return (
        <main className="min-h-screen bg-gray-50 text-gray-900">
            <Outlet />
            <GlobalToasts />
        </main>
    );
}

export default App;