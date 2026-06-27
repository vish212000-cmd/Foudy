/**
 * Abstract Media Layer
 * Hides whether we are using P2P (Mesh) or an SFU (LiveKit/Mediasoup) from the UI.
 */
export interface MediaStreamOptions {
    video: boolean;
    audio: boolean;
}

export class MediaService {
    private localStream: MediaStream | null = null;
    
    constructor() {
        // Initialization logic
    }

    async getLocalStream(options: MediaStreamOptions): Promise<MediaStream> {
        if (!this.localStream) {
            this.localStream = await navigator.mediaDevices.getUserMedia(options);
        }
        return this.localStream;
    }

    async connectToRoom(): Promise<void> {
        // Here we can dynamically decide P2P vs SFU based on room capacity returned by backend

    }
    
    stopLocalStream() {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }
    }
}

export const mediaService = new MediaService();
