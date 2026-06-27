import { useMediaStore } from '../../store/media';

export class MicrophoneManager {
    private stream: MediaStream | null = null;
    private audioTrack: MediaStreamTrack | null = null;

    public async startMicrophone(deviceId?: string): Promise<MediaStreamTrack | null> {
        try {
            const constraints: MediaStreamConstraints = {
                audio: deviceId ? { deviceId: { exact: deviceId } } : true,
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.audioTrack = this.stream.getAudioTracks()[0];

            if (this.audioTrack) {
                useMediaStore.getState().setMicrophoneState('ON');
                useMediaStore.getState().setActiveMicrophoneId(this.audioTrack.getSettings().deviceId || null);
                
                this.audioTrack.onended = () => {
                    useMediaStore.getState().setMicrophoneState('ERROR');
                };
            }

            return this.audioTrack;
        } catch (err) {
            console.error('Error starting microphone:', err);
            useMediaStore.getState().setMicrophoneState('ERROR');
            return null;
        }
    }

    public stopMicrophone() {
        if (this.audioTrack) {
            this.audioTrack.stop();
            this.audioTrack = null;
        }
        if (this.stream) {
            this.stream.getTracks().forEach(t => t.stop());
            this.stream = null;
        }
        useMediaStore.getState().setMicrophoneState('OFF');
        useMediaStore.getState().setActiveMicrophoneId(null);
    }

    public setMuted(muted: boolean) {
        if (this.audioTrack) {
            this.audioTrack.enabled = !muted;
            useMediaStore.getState().setMicrophoneState(muted ? 'MUTED' : 'ON');
        }
    }

    public getTrack(): MediaStreamTrack | null {
        return this.audioTrack;
    }
}
