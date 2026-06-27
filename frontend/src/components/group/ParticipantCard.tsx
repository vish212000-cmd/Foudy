import React, { useRef, useEffect } from 'react';
import type { GroupParticipant } from '../../store/group';

interface ParticipantCardProps {
    participant: GroupParticipant;
    isMain?: boolean;
}

export const ParticipantCard: React.FC<ParticipantCardProps> = ({ participant, isMain }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && participant.stream) {
            videoRef.current.srcObject = participant.stream;
        }
    }, [participant.stream]);

    return (
        <div className={`relative w-full h-full rounded-lg overflow-hidden bg-gray-900 border-2 ${participant.isSpeaking ? 'border-primary' : 'border-transparent'} transition-colors duration-200`}>
            {participant.isCameraOff ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <span className="text-4xl text-gray-400">User {participant.userId}</span>
                </div>
            ) : (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={false} // Would be true for local user
                    className={`w-full h-full ${isMain ? 'object-contain bg-black' : 'object-cover'}`}
                />
            )}
            
            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm flex items-center gap-2">
                <span>User {participant.userId}</span>
                {participant.isMuted && <span className="text-red-500">Muted</span>}
            </div>
        </div>
    );
};
