import React from 'react';
import { Camera, AlertCircle } from 'lucide-react';
import { useMediaStore } from '../../store/media';
import { useConnectionState } from '../../providers/ConnectionStateProvider';
import { useCallStore } from '../../store/call';

export const PermissionModal: React.FC = () => {
    const { cameraState, microphoneState } = useMediaStore();
    const { mediaService } = useConnectionState();

    if (cameraState !== 'UNAUTHORIZED' && microphoneState !== 'UNAUTHORIZED' && cameraState !== 'PENDING') {
        return null;
    }

    const handleGrantAccess = async () => {
        if (mediaService) {
            await mediaService.initialize();
            useCallStore.getState().setCallState('MEDIA_READY');
        }
    };

    return (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl max-w-sm w-full text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-6">
                    <Camera className="text-blue-500" size={32} />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">Camera & Mic Access</h3>
                
                {cameraState === 'UNAUTHORIZED' ? (
                    <div className="flex flex-col items-center">
                        <p className="text-gray-400 mb-6 text-sm">
                            We need access to your camera and microphone to start the call. Please allow permissions in your browser settings.
                        </p>
                        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 px-4 py-2 rounded-lg">
                            <AlertCircle size={16} />
                            Permissions Denied
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="text-gray-400 mb-6 text-sm">
                            We need access to your camera and microphone to start the call.
                        </p>
                        <button
                            onClick={handleGrantAccess}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-xl transition-colors w-full"
                        >
                            Grant Access
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
