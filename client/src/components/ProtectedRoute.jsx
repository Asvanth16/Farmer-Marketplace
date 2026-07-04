import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading, token } = useContext(AuthContext);

    // Show loading screen while AuthContext is fetching user data
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#060c18]">
                <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-emerald-500 mb-6"></div>
                <p className="text-slate-300 text-xl font-bold">
                    Loading Workspace...
                </p>
            </div>
        );
    }

    // Fallback to localStorage after page refresh
    const activeToken = token || localStorage.getItem('token');

    // Not logged in
    if (!user && !activeToken) {
        return <Navigate to="/login" replace />;
    }

    // Role-based access control
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {

        switch (user.role) {
            case 'admin':
                return <Navigate to="/admin/dashboard" replace />;

            case 'farmer':
                return <Navigate to="/farmer/dashboard" replace />;

            default:
                return <Navigate to="/customer/marketplace" replace />;
        }

    }

    return children;
}

export default ProtectedRoute;