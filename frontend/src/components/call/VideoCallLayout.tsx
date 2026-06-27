import React, { useEffect } from 'react';
import { LocalVideo } from './LocalVideo';
import { RemoteVideo } from './RemoteVideo';
import { CallControls } from './CallControls';
import { DeviceSelector } from './DeviceSelector';
import { PermissionModal } from './PermissionModal';
import { CallStatusOverlay } from './CallStatusOverlay';
import { QualityIndicator } from './QualityIndicator';
import { CallTimer } from './CallTimer';
import { ChatPanel } from '../chat/ChatPanel';
import { useConnectionState } from '../../providers/ConnectionStateProvider';
import { useCallStore } from '../../store/call';

export const VideoCallLayout: React.FC = () => {
    const [isChatOpen, setIsChatOpen] = React.useState(false);
    const { mediaService } = useConnectionState();
    const callState = useCallStore(state => state.callState);

    useEffect(() => {
        // Automatically start local media when permissions are ready
        if (callState === 'MEDIA_READY' && mediaService) {
            mediaService.startLocalMedia().then(() => {
                // If we are initiator, we could start the peer connection here, but that is typically driven by Signaling events
                // In a matchmaking flow, both sides get MATCH_FOUND, we get permissions, then we establish peer connection.
            });
        }
    }, [callState, mediaService]);

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col">
            {/* Background remote video (fill screen) */}
            <div className="absolute inset-0">
                <RemoteVideo />
            </div>

            {/* Overlays */}
            <CallStatusOverlay />
            <PermissionModal />
            
            {/* Top UI */}
            {(callState === 'CONNECTED' || callState === 'IN_CALL') && (
                <>
                    <QualityIndicator />
                    <CallTimer />
                    <DeviceSelector />
                </>
            )}

            {/* Floating Local Video (Picture in Picture) */}
            <div className="absolute bottom-32 right-8 w-48 h-72 sm:w-64 sm:h-96 shadow-2xl z-20 transition-all">
                <LocalVideo />
            </div>

            {/* Bottom Controls */}
            {(callState === 'CONNECTED' || callState === 'IN_CALL' || callState === 'RECONNECTING') && (
                <CallControls onToggleChat={() => setIsChatOpen(prev => !prev)} isChatOpen={isChatOpen} />
            )}
            
            {/* Chat Panel Overlay */}
            <ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </div>
    );
};
