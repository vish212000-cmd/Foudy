export class TrackManager {
    private pc: RTCPeerConnection;
    private videoSender: RTCRtpSender | null = null;
    private audioSender: RTCRtpSender | null = null;

    constructor(pc: RTCPeerConnection) {
        this.pc = pc;
    }

    public async replaceVideoTrack(track: MediaStreamTrack | null) {
        if (!this.videoSender) {
            // Find existing sender
            this.videoSender = this.pc.getSenders().find(s => s.track?.kind === 'video') || null;
            
            if (!this.videoSender && track) {
                // If no sender and we have a track, add it
                this.videoSender = this.pc.addTrack(track);
                return;
            }
        }
        
        if (this.videoSender) {
            await this.videoSender.replaceTrack(track);
        }
    }

    public async replaceAudioTrack(track: MediaStreamTrack | null) {
        if (!this.audioSender) {
            this.audioSender = this.pc.getSenders().find(s => s.track?.kind === 'audio') || null;
            
            if (!this.audioSender && track) {
                this.audioSender = this.pc.addTrack(track);
                return;
            }
        }
        
        if (this.audioSender) {
            await this.audioSender.replaceTrack(track);
        }
    }
}
