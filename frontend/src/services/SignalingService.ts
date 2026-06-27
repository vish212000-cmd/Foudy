import { useSignalingStore } from "../store/signaling";
import { v4 as uuidv4 } from "uuid";
import type { SignalingPayload } from "../types/signaling";
import type { MediaHardwareState } from "../types/media";

import { useSocketStore } from "../store/socket";

/**
 * SignalingService provides a reliable transport over the raw websocket.
 * It handles correlation IDs and timeouts.
 */
export class SignalingService {
    private retryTimeout = 5000;

    constructor() {}

    private sendWithAck(event: string, payload: Partial<SignalingPayload>) {
        const { status, sendMessage } = useSocketStore.getState();
        if (status !== 'connected') {
            console.error("SignalingService: WebSocket is not open");
            return;
        }

        const correlationId = uuidv4();
        const { matchId, targetUserId } = useSignalingStore.getState();

        if (!matchId) {
            console.error("SignalingService: No matchId set");
            return;
        }

        const fullPayload = {
            ...payload,
            version: "1.0",
            correlationId,
            matchId,
            ...(targetUserId ? { targetUserId } : {})
        };

        useSignalingStore.getState().addPendingMessage(correlationId, event, fullPayload);

        sendMessage(event, fullPayload);

        // Simple timeout logic - if not ACKed in 5s, we log it.
        // A full retry policy would re-queue the message.
        setTimeout(() => {
            const pending = useSignalingStore.getState().pendingMessages.get(correlationId);
            if (pending) {
                console.warn(`Signaling message ${event} [${correlationId}] timed out waiting for ACK.`);
                // We could retry here
            }
        }, this.retryTimeout);
    }

    public sendOffer(sdp: RTCSessionDescriptionInit) {
        useSignalingStore.getState().setState('NEGOTIATING');
        this.sendWithAck('signaling.offer', { sdp });
    }

    public sendAnswer(sdp: RTCSessionDescriptionInit) {
        useSignalingStore.getState().setState('CONNECTED');
        this.sendWithAck('signaling.answer', { sdp });
    }

    public sendIceCandidate(candidate: RTCIceCandidateInit) {
        this.sendWithAck('signaling.ice_candidate', { candidate });
    }
    
    public sendGroupSignal(roomId: string, targetUserId: string, payload: any) {
        this.sendWithAck('group.signal', { roomId, targetUserId, ...payload } as any);
    }
    
    public sendMediaUpdate(payload: { cameraState?: MediaHardwareState, microphoneState?: MediaHardwareState, isScreenSharing?: boolean }) {
        this.sendWithAck('signaling.media_update', payload);
    }

    public disconnect() {
        useSignalingStore.getState().setState('DISCONNECTED');
        this.sendWithAck('signaling.disconnect', { reason: 'User requested' });
    }
}
