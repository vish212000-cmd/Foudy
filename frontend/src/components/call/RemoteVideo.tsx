import React, { useEffect, useRef } from 'react';
import { useCallStore } from '../../store/call';

export const RemoteVideo: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const remoteStream = useCallStore(state => state.remoteStream);

    useEffect(() => {
        if (videoRef.current && remoteStream) {
            videoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    return (
        <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
            />
            {!remoteStream && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <span className="text-gray-400">Waiting for remote stream...</span>
                </div>
            )}
        </div>
    );
};
