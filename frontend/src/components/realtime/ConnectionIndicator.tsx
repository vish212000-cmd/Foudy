import React from 'react';
import { useSocketStore } from '../../store/socket';
import { cn } from '../../lib/utils';

export const ConnectionIndicator: React.FC = () => {
    const { status } = useSocketStore();
    
    return (
        <div 
            className="fixed bottom-4 right-4 z-50 flex items-center justify-center p-2 rounded-full bg-surface border border-border shadow-md"
            title={`Connection Status: ${status}`}
        >
            <div className="relative flex h-3 w-3">
                {status === 'connected' && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                )}
                <span className={cn(
                    "relative inline-flex rounded-full h-3 w-3",
                    status === 'connected' ? "bg-green-500" :
                    status === 'connecting' || status === 'reconnecting' ? "bg-yellow-500 animate-pulse" :
                    "bg-red-500"
                )}></span>
            </div>
        </div>
    );
};
