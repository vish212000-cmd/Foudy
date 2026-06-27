import { MediaPermissionService } from './MediaPermissionService';
import { DeviceManager } from './DeviceManager';
import { CameraManager } from './CameraManager';
import { MicrophoneManager } from './MicrophoneManager';
import { TrackManager } from './TrackManager';
import { SignalingService } from '../SignalingService';
import { useMediaStore } from '../../store/media';

export class MediaService {
    private deviceManager: DeviceManager;
    private cameraManager: CameraManager;
    private microphoneManager: MicrophoneManager;
    private trackManager: TrackManager | null = null;
    private signalingService: SignalingService;

    constructor(signalingService: SignalingService) {
        this.deviceManager = new DeviceManager();
        this.cameraManager = new CameraManager();
        this.microphoneManager = new MicrophoneManager();
        this.signalingService = signalingService;
    }

    public setTrackManager(trackManager: TrackManager) {
        this.trackManager = trackManager;
    }

    public async initialize() {
        const hasPermissions = await MediaPermissionService.checkPermissions();
        if (!hasPermissions) {
            // Need to request
            const stream = await MediaPermissionService.requestPermissions();
            if (stream) {
                stream.getTracks().forEach(t => t.stop()); // Just checking, we start properly later
            }
        }
        
        this.deviceManager.startListening();
        await this.deviceManager.enumerateDevices();
    }

    public async startLocalMedia(cameraId?: string, micId?: string) {
        const videoTrack = await this.cameraManager.startCamera(cameraId);
        const audioTrack = await this.microphoneManager.startMicrophone(micId);
        
        if (this.trackManager) {
            if (videoTrack) await this.trackManager.replaceVideoTrack(videoTrack);
            if (audioTrack) await this.trackManager.replaceAudioTrack(audioTrack);
        }
        
        this.broadcastMediaState();
    }
    
    public async switchCamera(deviceId: string) {
        this.cameraManager.stopCamera();
        const videoTrack = await this.cameraManager.startCamera(deviceId);
        if (this.trackManager && videoTrack) {
            await this.trackManager.replaceVideoTrack(videoTrack);
        }
        this.broadcastMediaState();
    }

    public toggleCameraMute(muted: boolean) {
        this.cameraManager.setMuted(muted);
        this.broadcastMediaState();
    }
    
    public toggleMicMute(muted: boolean) {
        this.microphoneManager.setMuted(muted);
        this.broadcastMediaState();
    }

    public stopAll() {
        this.cameraManager.stopCamera();
        this.microphoneManager.stopMicrophone();
        this.deviceManager.stopListening();
        this.broadcastMediaState();
    }

    public getLocalVideoStream(): MediaStream | null {
        return this.cameraManager.getStream();
    }

    private broadcastMediaState() {
        const { cameraState, microphoneState } = useMediaStore.getState();
        
        this.signalingService.sendMediaUpdate({
            cameraState,
            microphoneState
        });
    }
}
