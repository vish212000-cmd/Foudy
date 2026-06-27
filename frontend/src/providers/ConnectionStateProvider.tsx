import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useSocketStore } from '../store/socket';
import { useSignalingStore } from '../store/signaling';
import { useChatStore } from '../store/chat';
import { SignalingService } from '../services/SignalingService';
import { PeerConnectionManager } from '../services/PeerConnectionManager';
import { MediaService } from '../services/media/MediaService';
import { ChatService } from '../services/ChatService';

interface ConnectionStateContextValue {
    peerManager: PeerConnectionManager | null;
    mediaService: MediaService | null;
}

const ConnectionStateContext = createContext<ConnectionStateContextValue>({ peerManager: null, mediaService: null });

export const useConnectionState = () => useContext(ConnectionStateContext);

export const ConnectionStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { lastEvent } = useSocketStore();
    const resolvePendingMessage = useSignalingStore(state => state.resolvePendingMessage);
    
    const peerManagerRef = useRef<PeerConnectionManager | null>(null);
    const mediaServiceRef = useRef<MediaService | null>(null);

    useEffect(() => {
        // Initialize if not already
        if (!peerManagerRef.current) {
            const sigService = new SignalingService();
            const mediaService = new MediaService(sigService);
            mediaServiceRef.current = mediaService;
            peerManagerRef.current = new PeerConnectionManager(sigService, mediaService);
        }
    }, []);

    useEffect(() => {
        if (!lastEvent || !peerManagerRef.current) return;

        const { event, payload } = lastEvent;

        if (event === 'signaling.ack') {
            resolvePendingMessage(payload.correlationId);
        } else if (event === 'chat.ack') {
            const msgId = payload.correlationId;
            if (payload.duplicate) return;
            // Update optimism
            useChatStore.getState().updateMessageState(msgId, 'SENT');
        } else if (event === 'chat.error') {
            const msgId = payload.correlationId;
            useChatStore.getState().updateMessageState(msgId, 'FAILED');
            console.error("Chat error:", payload);
        } else if (event === 'chat.message') {
            const { content, correlationId, senderId, timestamp } = payload;
            useChatStore.getState().addMessage({
                id: correlationId,
                content,
                senderId,
                timestamp,
                state: 'DELIVERED'
            });
            // Send delivery ack
            const chatService = new ChatService();
            chatService.sendDelivered(correlationId);
            
            // Unread count tracking
            useChatStore.getState().incrementUnread();
        } else if (event === 'chat.typing') {
            useChatStore.getState().setPeerTyping(true);
        } else if (event === 'chat.typing_stop') {
            useChatStore.getState().setPeerTyping(false);
        } else if (event === 'chat.delivered') {
            useChatStore.getState().updateMessageState(payload.messageId, 'DELIVERED');
        } else if (event === 'signaling.offer') {
            peerManagerRef.current.handleOffer(payload.sdp);
        } else if (event === 'signaling.answer') {
            peerManagerRef.current.handleAnswer(payload.sdp);
        } else if (event === 'signaling.ice_candidate') {
            peerManagerRef.current.handleIceCandidate(payload.candidate);
        } else if (event === 'signaling.disconnect') {
            peerManagerRef.current.close();
        }

    }, [lastEvent, resolvePendingMessage]);

    return (
        <ConnectionStateContext.Provider value={{ peerManager: peerManagerRef.current, mediaService: mediaServiceRef.current }}>
            {children}
        </ConnectionStateContext.Provider>
    );
};
