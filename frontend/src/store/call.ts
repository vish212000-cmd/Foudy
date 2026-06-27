import { create } from 'zustand';
import type { CallState, QualityMetrics } from '../types/call';

interface CallStoreState {
    callState: CallState;
    remoteStream: MediaStream | null;
    durationSeconds: number;
    qualityMetrics: QualityMetrics;
    
    setCallState: (state: CallState) => void;
    setRemoteStream: (stream: MediaStream | null) => void;
    incrementDuration: () => void;
    setQualityMetrics: (metrics: Partial<QualityMetrics>) => void;
    
    reset: () => void;
}

const defaultQualityMetrics: QualityMetrics = {
    signalStrength: 'DISCONNECTED',
    packetLoss: 0,
    bitrate: 0,
    resolution: '0x0',
    fps: 0,
    latency: 0
};

export const useCallStore = create<CallStoreState>((set) => ({
    callState: 'ENDED',
    remoteStream: null,
    durationSeconds: 0,
    qualityMetrics: { ...defaultQualityMetrics },
    
    setCallState: (state) => set({ callState: state }),
    setRemoteStream: (stream) => set({ remoteStream: stream }),
    incrementDuration: () => set((prev) => ({ durationSeconds: prev.durationSeconds + 1 })),
    setQualityMetrics: (metrics) => set((prev) => ({ 
        qualityMetrics: { ...prev.qualityMetrics, ...metrics } 
    })),
    
    reset: () => set({
        callState: 'ENDED',
        remoteStream: null,
        durationSeconds: 0,
        qualityMetrics: { ...defaultQualityMetrics }
    })
}));
