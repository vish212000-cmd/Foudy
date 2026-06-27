import React from 'react';
import { useNotificationStore } from '../../store/notifications';

export const NotificationBadge: React.FC = () => {
    const unreadCount = useNotificationStore(state => state.unreadCount);

    if (unreadCount === 0) return null;

    return (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
        </div>
    );
};
