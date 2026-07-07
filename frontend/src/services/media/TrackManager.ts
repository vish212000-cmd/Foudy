export class TrackManager {
    private pc: RTCPeerConnection;
    private videoSender: RTCRtpSender | null = null;
    private audioSender: RTCRtpSender | null = null;
    private localStream: MediaStream;

    constructor(pc: RTCPeerConnection) {
        this.pc = pc;
        this.localStream = new MediaStream();
    }

    public async replaceVideoTrack(track: MediaStreamTrack | null) {
        if (!this.videoSender) {
            // Find existing sender
            this.videoSender = this.pc.getSenders().find(s => s.track?.kind === 'video') || null;
            
            if (!this.videoSender && track) {
                // Add to our unified local stream
                this.localStream.addTrack(track);
                // Add to peer connection WITH the stream
                this.videoSender = this.pc.addTrack(track, this.localStream);
                return;
            }
        }
        
        if (this.videoSender && track) {
            await this.videoSender.replaceTrack(track);
        }
    }

    public async replaceAudioTrack(track: MediaStreamTrack | null) {
        if (!this.audioSender) {
            this.audioSender = this.pc.getSenders().find(s => s.track?.kind === 'audio') || null;
            
            if (!this.audioSender && track) {
                // Add to our unified local stream
                this.localStream.addTrack(track);
                // Add to peer connection WITH the stream
                this.audioSender = this.pc.addTrack(track, this.localStream);
                return;
            }
        }
        
        if (this.audioSender && track) {
            await this.audioSender.replaceTrack(track);
        }
    }
}
