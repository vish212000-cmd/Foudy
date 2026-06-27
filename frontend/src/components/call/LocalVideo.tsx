import React, { useEffect, useRef } from 'react';
import { useMediaStore } from '../../store/media';
import { useConnectionState } from '../../providers/ConnectionStateProvider';

export const LocalVideo: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { cameraState } = useMediaStore();
    const { mediaService } = useConnectionState();

    useEffect(() => {
        if (!mediaService || !videoRef.current) return;
        
        if (cameraState === 'ON') {
            const stream = mediaService.getLocalVideoStream();
            if (stream) {
                videoRef.current.srcObject = stream;
            }
        } else {
            videoRef.current.srcObject = null;
        }
    }, [mediaService, cameraState]);

    return (
        <div className="relative w-full h-full bg-black rounded-lg overflow-hidden border-2 border-gray-800">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${cameraState === 'ON' ? '' : 'hidden'}`}
                style={{ transform: 'scaleX(-1)' }}
            />
            {cameraState !== 'ON' && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <span className="text-gray-400">Camera Off</span>
                </div>
            )}
        </div>
    );
};
