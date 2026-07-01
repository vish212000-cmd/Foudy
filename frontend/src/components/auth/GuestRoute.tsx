import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';

export const GuestRoute = () => {
    const { user, isAuthenticated, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    if (isAuthenticated) {
        if (user && !user.profile_completed) {
            return <Navigate to="/setup" replace />;
        }
        return <Navigate to="/home" replace />;
    }

    return <Outlet />;
};
