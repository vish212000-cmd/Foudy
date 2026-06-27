import { create } from 'zustand';
import type { MediaHardwareState, MediaDevices } from '../types/media';

interface MediaStoreState {
    cameraState: MediaHardwareState;
    microphoneState: MediaHardwareState;
    
    devices: MediaDevices;
    
    activeCameraId: string | null;
    activeMicrophoneId: string | null;
    
    setCameraState: (state: MediaHardwareState) => void;
    setMicrophoneState: (state: MediaHardwareState) => void;
    setDevices: (devices: MediaDevices) => void;
    setActiveCameraId: (id: string | null) => void;
    setActiveMicrophoneId: (id: string | null) => void;
    
    reset: () => void;
}

export const useMediaStore = create<MediaStoreState>((set) => ({
    cameraState: 'OFF',
    microphoneState: 'OFF',
    
    devices: {
        videoinput: [],
        audioinput: [],
        audiooutput: []
    },
    
    activeCameraId: null,
    activeMicrophoneId: null,
    
    setCameraState: (state) => set({ cameraState: state }),
    setMicrophoneState: (state) => set({ microphoneState: state }),
    setDevices: (devices) => set({ devices }),
    setActiveCameraId: (id) => set({ activeCameraId: id }),
    setActiveMicrophoneId: (id) => set({ activeMicrophoneId: id }),
    
    reset: () => set({
        cameraState: 'OFF',
        microphoneState: 'OFF',
        devices: { videoinput: [], audioinput: [], audiooutput: [] },
        activeCameraId: null,
        activeMicrophoneId: null
    })
}));
