import React, { useEffect } from 'react';
import { useCallStore } from '../../store/call';

export const CallTimer: React.FC = () => {
    const { callState, durationSeconds, incrementDuration } = useCallStore();

    useEffect(() => {
        let interval: number;
        if (callState === 'IN_CALL' || callState === 'CONNECTED') {
            interval = window.setInterval(() => {
                incrementDuration();
            }, 1000);
        }
        return () => {
            if (interval) window.clearInterval(interval);
        };
    }, [callState, incrementDuration]);

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (durationSeconds === 0) return null;

    return (
        <div className="absolute top-4 left-32 sm:left-48 bg-gray-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 z-10">
            <span className="text-sm font-mono font-medium text-white tracking-wider">
                {formatTime(durationSeconds)}
            </span>
        </div>
    );
};
