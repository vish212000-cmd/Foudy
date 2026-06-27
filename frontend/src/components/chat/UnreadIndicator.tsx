import React from 'react';
import { useChatStore } from '../../store/chat';

export const UnreadIndicator: React.FC = () => {
    const unreadCount = useChatStore(state => state.unreadCount);

    if (unreadCount === 0) return null;

    return (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-900">
            {unreadCount > 9 ? '9+' : unreadCount}
        </div>
    );
};
