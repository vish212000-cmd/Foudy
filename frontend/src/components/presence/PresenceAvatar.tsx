import React from 'react';
import type { PresenceState } from '../../store/presence';
import { PresenceIndicator } from './PresenceIndicator';

interface Props {
    imageUrl?: string;
    username: string;
    state: PresenceState;
    size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
};

export const PresenceAvatar: React.FC<Props> = ({ imageUrl, username, state, size = 'md' }) => {
    return (
        <div className="relative inline-block">
            <div className={`${sizeClasses[size]} rounded-full bg-gray-800 overflow-hidden flex items-center justify-center text-white font-bold`}>
                {imageUrl ? (
                    <img src={imageUrl} alt={username} className="w-full h-full object-cover" />
                ) : (
                    <span>{username.charAt(0).toUpperCase()}</span>
                )}
            </div>
            <PresenceIndicator state={state} className="absolute bottom-0 right-0" />
        </div>
    );
};
