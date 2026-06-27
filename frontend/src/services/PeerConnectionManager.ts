import { SignalingService } from "./SignalingService";
import { useSignalingStore } from "../store/signaling";
import { useCallStore } from "../store/call";
import { useMediaStore } from "../store/media";
import { MediaService } from "./media/MediaService";
import { TrackManager } from "./media/TrackManager";

export class PeerConnectionManager {
    private pc: RTCPeerConnection | null = null;
    private signalingService: SignalingService;
    private mediaService: MediaService;

    constructor(signalingService: SignalingService, mediaService: MediaService) {
        this.signalingService = signalingService;
        this.mediaService = mediaService;
    }

    public createPeer(isInitiator: boolean = false) {
        if (this.pc) {
            this.close();
        }

        useSignalingStore.getState().setState('CREATED');

        const iceServers = import.meta.env.VITE_TURN_URL ? [
            {
                urls: import.meta.env.VITE_TURN_URL,
                username: import.meta.env.VITE_TURN_USERNAME,
                credential: import.meta.env.VITE_TURN_PASSWORD
            }
        ] : [{ urls: 'stun:stun.l.google.com:19302' }];

        this.pc = new RTCPeerConnection({
            iceServers
        });

        this.pc.onicecandidate = (event) => {
            if (event.candidate) {
                this.signalingService.sendIceCandidate(event.candidate.toJSON());
            }
        };

        this.pc.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
                useCallStore.getState().setRemoteStream(event.streams[0]);
            }
        };

        this.pc.oniceconnectionstatechange = () => {
            if (!this.pc) return;
            switch (this.pc.iceConnectionState) {
                case 'connected':
                    useCallStore.getState().setCallState('IN_CALL');
                    break;
                case 'disconnected':
                    useCallStore.getState().setCallState('RECONNECTING');
                    this.restartIce();
                    break;
                case 'failed':
                    useCallStore.getState().setCallState('ERROR');
                    break;
                case 'closed':
                    useCallStore.getState().setCallState('ENDED');
                    break;
            }
        };

        this.pc.onconnectionstatechange = () => {
            if (!this.pc) return;
            switch (this.pc.connectionState) {
                case 'connected':
                    useSignalingStore.getState().setState('CONNECTED');
                    break;
                case 'disconnected':
                    useSignalingStore.getState().setState('DISCONNECTED');
                    break;
                case 'failed':
                    useSignalingStore.getState().setState('FAILED');
                    break;
                case 'closed':
                    useSignalingStore.getState().setState('CLOSED');
                    break;
            }
        };

        this.pc.onnegotiationneeded = async () => {
            try {
                if (isInitiator) {
                    await this.renegotiate();
                }
            } catch (err) {
                console.error("Negotiation failed", err);
            }
        };

        const trackManager = new TrackManager(this.pc);
        this.mediaService.setTrackManager(trackManager);

        if (isInitiator) {
            this.renegotiate();
        }
    }

    public async renegotiate() {
        if (!this.pc) return;
        const offer = await this.pc.createOffer();
        await this.pc.setLocalDescription(offer);
        this.signalingService.sendOffer(this.pc.localDescription as RTCSessionDescriptionInit);
    }

    public async handleOffer(sdp: RTCSessionDescriptionInit) {
        if (!this.pc) this.createPeer(false);
        await this.pc!.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await this.pc!.createAnswer();
        await this.pc!.setLocalDescription(answer);
        this.signalingService.sendAnswer(this.pc!.localDescription as RTCSessionDescriptionInit);
    }

    public async handleAnswer(sdp: RTCSessionDescriptionInit) {
        if (!this.pc) return;
        await this.pc.setRemoteDescription(new RTCSessionDescription(sdp));
    }

    public async handleIceCandidate(candidate: RTCIceCandidateInit) {
        if (!this.pc) return;
        try {
            await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
            console.error("Error adding received ice candidate", err);
        }
    }

    public restartIce() {
        if (this.pc) {
            this.pc.restartIce();
        }
    }

    public close() {
        if (this.pc) {
            this.pc.getSenders().forEach(sender => {
                if (sender.track) {
                    sender.track.stop();
                }
            });
            this.pc.close();
            this.pc = null;
        }
        
        useSignalingStore.getState().setState('CLOSED');
        useCallStore.getState().reset();
        useMediaStore.getState().reset();
    }
}
