import { useGroupStore } from '../../store/group';

export class ActiveSpeakerService {
    private audioContext: AudioContext | null = null;
    private analysers: Map<number, AnalyserNode> = new Map();
    private sources: Map<number, MediaStreamAudioSourceNode> = new Map();
    private intervalId: number | null = null;
    private SPEAKING_THRESHOLD = 0.02; // Roughly scaled for Float32

    public startMonitoring() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        this.intervalId = window.setInterval(() => this.analyze(), 250);
    }

    public addStream(userId: number, stream: MediaStream) {
        if (!this.audioContext) return;
        
        // Only process if it has an audio track
        if (stream.getAudioTracks().length === 0) return;

        const analyser = this.audioContext.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.4;
        
        const source = this.audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        
        this.analysers.set(userId, analyser);
        this.sources.set(userId, source);
    }

    public removeStream(userId: number) {
        const source = this.sources.get(userId);
        if (source) {
            source.disconnect();
            this.sources.delete(userId);
        }
        this.analysers.delete(userId);
    }

    private analyze() {
        let maxVolume = 0;
        let activeSpeakerId: number | null = null;

        this.analysers.forEach((analyser, userId) => {
            const dataArray = new Float32Array(analyser.fftSize);
            analyser.getFloatTimeDomainData(dataArray);

            // Calculate RMS
            let sumSquares = 0;
            for (let i = 0; i < dataArray.length; i++) {
                sumSquares += dataArray[i] * dataArray[i];
            }
            const rms = Math.sqrt(sumSquares / dataArray.length);

            if (rms > this.SPEAKING_THRESHOLD) {
                useGroupStore.getState().updateParticipant(userId, { isSpeaking: true });
                if (rms > maxVolume) {
                    maxVolume = rms;
                    activeSpeakerId = userId;
                }
            } else {
                useGroupStore.getState().updateParticipant(userId, { isSpeaking: false });
            }
        });

        // Hysteresis can be added here if needed, but for now we set the max
        if (activeSpeakerId !== null) {
            useGroupStore.getState().setActiveSpeaker(activeSpeakerId);
        }
    }

    public stopMonitoring() {
        if (this.intervalId) {
            window.clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.analysers.clear();
        this.sources.forEach(s => s.disconnect());
        this.sources.clear();
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}
