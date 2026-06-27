import React from 'react';
import type { PresenceState } from '../../store/presence';

interface Props {
    state: PresenceState;
    className?: string;
}

const stateColors: Record<PresenceState, string> = {
    ONLINE: 'bg-green-500',
    OFFLINE: 'bg-gray-500',
    MATCHING: 'bg-blue-500',
    IN_CALL: 'bg-red-500',
    IN_ROOM: 'bg-purple-500',
    AWAY: 'bg-yellow-500',
    RECONNECTING: 'bg-orange-500',
    DISCONNECTED: 'bg-gray-400'
};

export const PresenceIndicator: React.FC<Props> = ({ state, className = '' }) => {
    return (
        <div className={`w-3 h-3 rounded-full border-2 border-gray-900 ${stateColors[state]} ${className}`} 
             title={state} />
    );
};
