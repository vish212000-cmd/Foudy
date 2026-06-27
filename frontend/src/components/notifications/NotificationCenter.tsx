import React, { useState } from 'react';
import { useNotificationStore } from '../../store/notifications';
import { NotificationBadge } from './NotificationBadge';

export const NotificationCenter: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const notifications = useNotificationStore(state => state.notifications);
    const markAsRead = useNotificationStore(state => state.markAsRead);
    const markAllAsRead = useNotificationStore(state => state.markAllAsRead);

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-gray-800 transition-colors"
            >
                <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <NotificationBadge />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950">
                        <h3 className="font-bold text-white">Notifications</h3>
                        <button onClick={markAllAsRead} className="text-xs text-primary hover:text-primary/80 font-semibold">
                            Mark all read
                        </button>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div 
                                    key={n.id} 
                                    onClick={() => markAsRead(n.id)}
                                    className={`p-4 border-b border-gray-800 hover:bg-gray-800 cursor-pointer transition-colors ${!n.is_read ? 'bg-gray-800/50' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs font-bold text-primary">{n.type.replace('_', ' ')}</span>
                                        <span className="text-xs text-gray-500">{new Date(n.created_at).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-300">{n.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
