import { SignalingService } from '../SignalingService';
import { useGroupStore } from '../../store/group';

export class GroupPeerManager {
    private peers: Map<number, RTCPeerConnection> = new Map();
    private localStream: MediaStream | null = null;
    private signalingService: SignalingService;
    private roomId: number;

    constructor(signalingService: SignalingService, roomId: number) {
        this.signalingService = signalingService;
        this.roomId = roomId;
    }

    public setLocalStream(stream: MediaStream) {
        this.localStream = stream;
        this.peers.forEach(pc => {
            this.replaceTracks(pc, stream);
        });
    }

    private replaceTracks(pc: RTCPeerConnection, stream: MediaStream) {
        const senders = pc.getSenders();
        stream.getTracks().forEach(track => {
            const sender = senders.find(s => s.track?.kind === track.kind);
            if (sender) {
                sender.replaceTrack(track);
            } else {
                pc.addTrack(track, stream);
            }
        });
    }

    public createPeer(targetUserId: number, isInitiator: boolean = false) {
        if (this.peers.has(targetUserId)) {
            this.closePeer(targetUserId);
        }

        const iceServers = import.meta.env.VITE_TURN_URL ? [
            {
                urls: import.meta.env.VITE_TURN_URL,
                username: import.meta.env.VITE_TURN_USERNAME,
                credential: import.meta.env.VITE_TURN_PASSWORD
            }
        ] : [{ urls: 'stun:stun.l.google.com:19302' }];

        const pc = new RTCPeerConnection({
            iceServers
        });
        
        this.peers.set(targetUserId, pc);

        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                pc.addTrack(track, this.localStream!);
            });
        }

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                // We'd use a generic signaling service that can target a specific user
                this.signalingService.sendGroupSignal(this.roomId.toString(), targetUserId.toString(), {
                    type: 'candidate',
                    candidate: event.candidate.toJSON()
                });
            }
        };

        pc.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
                useGroupStore.getState().updateParticipant(targetUserId, {
                    stream: event.streams[0]
                });
            }
        };

        pc.onconnectionstatechange = () => {
            switch (pc.connectionState) {
                case 'connected':
                    useGroupStore.getState().updateParticipant(targetUserId, { state: 'CONNECTED' });
                    break;
                case 'disconnected':
                case 'failed':
                    useGroupStore.getState().updateParticipant(targetUserId, { state: 'RECONNECTING' });
                    // Trigger ICE restart if it fails completely
                    if (pc.connectionState === 'failed') pc.restartIce();
                    break;
                case 'closed':
                    useGroupStore.getState().updateParticipant(targetUserId, { state: 'DISCONNECTED' });
                    break;
            }
        };

        pc.onnegotiationneeded = async () => {
            if (isInitiator) {
                await this.renegotiate(targetUserId);
            }
        };

        if (isInitiator) {
            this.renegotiate(targetUserId);
        }
    }

    public async renegotiate(targetUserId: number) {
        const pc = this.peers.get(targetUserId);
        if (!pc) return;
        try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            this.signalingService.sendGroupSignal(this.roomId.toString(), targetUserId.toString(), {
                type: 'offer',
                sdp: pc.localDescription as RTCSessionDescriptionInit
            });
        } catch (err) {
            console.error(`Negotiation failed with user ${targetUserId}`, err);
        }
    }

    public async handleSignal(fromUserId: number, signal: any) {
        let pc = this.peers.get(fromUserId);
        if (!pc && signal.type === 'offer') {
            this.createPeer(fromUserId, false);
            pc = this.peers.get(fromUserId);
        }
        
        if (!pc) return;

        if (signal.type === 'offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            this.signalingService.sendGroupSignal(this.roomId.toString(), fromUserId.toString(), {
                type: 'answer',
                sdp: pc.localDescription as RTCSessionDescriptionInit
            });
        } else if (signal.type === 'answer') {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        } else if (signal.type === 'candidate') {
            await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        }
    }

    public closePeer(userId: number) {
        const pc = this.peers.get(userId);
        if (pc) {
            pc.close();
            this.peers.delete(userId);
        }
    }

    public closeAll() {
        this.peers.forEach(pc => pc.close());
        this.peers.clear();
        this.localStream = null;
    }
}
