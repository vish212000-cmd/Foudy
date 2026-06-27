import { useMediaStore } from '../../store/media';
import type { MediaDevices } from '../../types/media';

export class DeviceManager {
    private isListening = false;

    private handleDeviceChange = async () => {
        await this.enumerateDevices();
    };

    public startListening() {
        if (!this.isListening) {
            navigator.mediaDevices.addEventListener('devicechange', this.handleDeviceChange);
            this.isListening = true;
        }
    }

    public stopListening() {
        if (this.isListening) {
            navigator.mediaDevices.removeEventListener('devicechange', this.handleDeviceChange);
            this.isListening = false;
        }
    }

    public async enumerateDevices(): Promise<MediaDevices> {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            
            const categorized: MediaDevices = {
                videoinput: [],
                audioinput: [],
                audiooutput: []
            };

            devices.forEach(device => {
                if (device.kind === 'videoinput') categorized.videoinput.push(device);
                if (device.kind === 'audioinput') categorized.audioinput.push(device);
                if (device.kind === 'audiooutput') categorized.audiooutput.push(device);
            });

            useMediaStore.getState().setDevices(categorized);
            return categorized;
        } catch (err) {
            console.error('Error enumerating devices:', err);
            return { videoinput: [], audioinput: [], audiooutput: [] };
        }
    }
}
