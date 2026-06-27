import React from 'react';
import { useMediaStore } from '../../store/media';
import { HostControls } from './HostControls';

export const GroupCallControls: React.FC = () => {
    const cameraState = useMediaStore(state => state.cameraState);
    const microphoneState = useMediaStore(state => state.microphoneState);
    const setCameraState = useMediaStore(state => state.setCameraState);
    const setMicrophoneState = useMediaStore(state => state.setMicrophoneState);

    const isMuted = microphoneState === 'OFF' || microphoneState === 'MUTED';
    const isCameraOff = cameraState === 'OFF' || cameraState === 'MUTED';

    const toggleAudio = () => setMicrophoneState(isMuted ? 'ON' : 'MUTED');
    const toggleVideo = () => setCameraState(isCameraOff ? 'ON' : 'MUTED');
    
    // In a real app we check auth context for isHost
    const isHost = true; 

    return (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-gray-900/90 p-4 rounded-2xl backdrop-blur">
            <button 
                onClick={toggleAudio}
                className={`w-12 h-12 rounded-full flex items-center justify-center ${isMuted ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
                {isMuted ? 'Muted' : 'Mic'}
            </button>

            <button 
                onClick={toggleVideo}
                className={`w-12 h-12 rounded-full flex items-center justify-center ${isCameraOff ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
                {isCameraOff ? 'CamOff' : 'CamOn'}
            </button>

            {isHost && <HostControls />}

            <button className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full">
                Leave Call
            </button>
        </div>
    );
};
