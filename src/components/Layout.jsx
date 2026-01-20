import React from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import NotificationBootstrap from './NotificationBootstrap';

export default function Layout({ children }) {
    const { user, userRole } = useAuth();

    // Robust check for Super Admin
    const isSuperAdmin =
        (userRole && (userRole === 'SUPERADMIN' || userRole === 'SuperAdmin' || userRole === 'superadmin')) ||
        user?.is_super_admin === true;

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-light via-blue-50 to-light dark:from-dark-bg dark:via-dark-bg dark:to-dark-bg transition-colors">
            <Navbar />
            <NotificationBootstrap />
            <div className="flex-1 overflow-auto bg-gray-50 dark:bg-dark-bg transition-colors duration-200 md:ml-72 pt-16 md:pt-0">
                {children}
            </div>
        </div>
    );
}
