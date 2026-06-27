export type MediaHardwareState = 'PENDING' | 'UNAUTHORIZED' | 'ON' | 'OFF' | 'MUTED' | 'ERROR';

export interface MediaDevices {
    videoinput: MediaDeviceInfo[];
    audioinput: MediaDeviceInfo[];
    audiooutput: MediaDeviceInfo[];
}

export interface MediaUpdatePayload {
    cameraState?: MediaHardwareState;
    microphoneState?: MediaHardwareState;
    isScreenSharing?: boolean;
}
