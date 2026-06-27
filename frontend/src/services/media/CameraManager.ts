import { useMediaStore } from '../../store/media';

export class CameraManager {
    private stream: MediaStream | null = null;
    private videoTrack: MediaStreamTrack | null = null;

    public async startCamera(deviceId?: string): Promise<MediaStreamTrack | null> {
        try {
            const constraints: MediaStreamConstraints = {
                video: deviceId ? { deviceId: { exact: deviceId } } : true,
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.videoTrack = this.stream.getVideoTracks()[0];

            if (this.videoTrack) {
                useMediaStore.getState().setCameraState('ON');
                useMediaStore.getState().setActiveCameraId(this.videoTrack.getSettings().deviceId || null);
                
                this.videoTrack.onended = () => {
                    useMediaStore.getState().setCameraState('ERROR');
                };
            }

            return this.videoTrack;
        } catch (err) {
            console.error('Error starting camera:', err);
            useMediaStore.getState().setCameraState('ERROR');
            return null;
        }
    }

    public stopCamera() {
        if (this.videoTrack) {
            this.videoTrack.stop();
            this.videoTrack = null;
        }
        if (this.stream) {
            this.stream.getTracks().forEach(t => t.stop());
            this.stream = null;
        }
        useMediaStore.getState().setCameraState('OFF');
        useMediaStore.getState().setActiveCameraId(null);
    }

    public setMuted(muted: boolean) {
        if (this.videoTrack) {
            this.videoTrack.enabled = !muted;
            useMediaStore.getState().setCameraState(muted ? 'MUTED' : 'ON');
        }
    }

    public getTrack(): MediaStreamTrack | null {
        return this.videoTrack;
    }

    public getStream(): MediaStream | null {
        return this.stream;
    }
}
