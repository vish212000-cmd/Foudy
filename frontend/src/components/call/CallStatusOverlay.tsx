import React from 'react';
import { useCallStore } from '../../store/call';
import { Loader2 } from 'lucide-react';

export const CallStatusOverlay: React.FC = () => {
    const callState = useCallStore(state => state.callState);

    const overlays = {
        MATCH_FOUND: 'Preparing match...',
        NEGOTIATING: 'Connecting...',
        CONNECTING: 'Establishing connection...',
        RECONNECTING: 'Reconnecting...',
        ENDING: 'Ending call...',
        ERROR: 'Connection failed',
        ENDED: 'Call ended'
    };

    const statusText = overlays[callState as keyof typeof overlays];

    if (!statusText || callState === 'IN_CALL' || callState === 'CONNECTED' || callState === 'PERMISSION_REQUEST') {
        return null;
    }

    return (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-40 flex flex-col items-center justify-center">
            {callState !== 'ERROR' && callState !== 'ENDED' && (
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            )}
            <h2 className="text-2xl font-bold text-white tracking-tight">{statusText}</h2>
        </div>
    );
};
