import React from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, FastForward, MessageCircle } from 'lucide-react';
import { useMediaStore } from '../../store/media';
import { useConnectionState } from '../../providers/ConnectionStateProvider';
import { useCallStore } from '../../store/call';
import { UnreadIndicator } from '../chat/UnreadIndicator';
import { useChatStore } from '../../store/chat';
import { useSignalingStore } from '../../store/signaling';
import { ReportDialog } from '../safety/ReportDialog';
import { BlockDialog } from '../safety/BlockDialog';
import { ShieldAlert } from 'lucide-react';

interface Props {
    onToggleChat?: () => void;
    isChatOpen?: boolean;
}

export const CallControls: React.FC<Props> = ({ onToggleChat, isChatOpen }) => {
    const { cameraState, microphoneState } = useMediaStore();
    const { peerManager, mediaService } = useConnectionState();
    const targetUserId = useSignalingStore(state => state.targetUserId);
    
    const [showSafetyMenu, setShowSafetyMenu] = React.useState(false);
    const [showReport, setShowReport] = React.useState(false);
    const [showBlock, setShowBlock] = React.useState(false);

    const handleToggleMute = () => {
        if (mediaService) {
            mediaService.toggleMicMute(microphoneState === 'ON');
        }
    };

    const handleToggleVideo = () => {
        if (mediaService) {
            mediaService.toggleCameraMute(cameraState === 'ON');
        }
    };

    const handleEndCall = () => {
        if (peerManager) {
            useCallStore.getState().setCallState('ENDING');
            peerManager.close();
        }
    };

    const handleSkip = () => {
        handleEndCall();
        // Redirect to matchmaking or re-queue logic would go here
    };

    const handleToggleChat = () => {
        if (onToggleChat) onToggleChat();
        if (!isChatOpen) {
            useChatStore.getState().resetUnread();
        }
    };

    const btnClass = "p-4 rounded-full flex items-center justify-center transition-colors shadow-lg";

    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-gray-900/80 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10 z-20">
            <button
                onClick={handleToggleMute}
                className={`${btnClass} ${microphoneState === 'MUTED' || microphoneState === 'OFF' ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
            >
                {microphoneState === 'MUTED' || microphoneState === 'OFF' ? <MicOff size={24} /> : <Mic size={24} />}
            </button>

            <button
                onClick={handleToggleVideo}
                className={`${btnClass} ${cameraState === 'MUTED' || cameraState === 'OFF' ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
            >
                {cameraState === 'MUTED' || cameraState === 'OFF' ? <VideoOff size={24} /> : <Video size={24} />}
            </button>

            <button
                onClick={handleEndCall}
                className={`${btnClass} bg-red-600 text-white hover:bg-red-700`}
            >
                <PhoneOff size={24} />
            </button>

            <button 
                onClick={handleToggleChat}
                className={`p-4 rounded-full transition-colors relative ${isChatOpen ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}
                title="Toggle Chat"
            >
                <MessageCircle size={24} />
                {!isChatOpen && <UnreadIndicator />}
            </button>

            <button
                onClick={handleSkip}
                className={`${btnClass} bg-gray-800 text-gray-200 hover:bg-gray-700`}
                title="Skip to next person"
            >
                <FastForward size={24} />
            </button>
            
            {/* Safety Options */}
            <div className="relative">
                <button
                    onClick={() => setShowSafetyMenu(!showSafetyMenu)}
                    className={`${btnClass} bg-red-500/10 text-red-500 hover:bg-red-500/20`}
                    title="Safety Options"
                >
                    <ShieldAlert size={24} />
                </button>
                
                {showSafetyMenu && (
                    <div className="absolute bottom-full mb-4 right-0 bg-gray-900 border border-gray-800 rounded-xl shadow-xl overflow-hidden min-w-[150px] flex flex-col py-2 z-30">
                        <button 
                            onClick={() => { setShowReport(true); setShowSafetyMenu(false); }}
                            className="px-4 py-3 text-left hover:bg-gray-800 text-white font-medium transition-colors"
                        >
                            Report User
                        </button>
                        <button 
                            onClick={() => { setShowBlock(true); setShowSafetyMenu(false); }}
                            className="px-4 py-3 text-left hover:bg-gray-800 text-red-500 font-bold transition-colors"
                        >
                            Block User
                        </button>
                    </div>
                )}
            </div>

            {targetUserId && (
                <>
                    <ReportDialog 
                        targetUserId={targetUserId} 
                        isOpen={showReport} 
                        onClose={() => setShowReport(false)} 
                    />
                    <BlockDialog 
                        targetUserId={targetUserId} 
                        isOpen={showBlock} 
                        onClose={() => setShowBlock(false)} 
                    />
                </>
            )}
        </div>
    );
};
