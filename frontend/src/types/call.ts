export type CallState = 
  | 'MATCH_FOUND' 
  | 'PERMISSION_REQUEST' 
  | 'MEDIA_READY' 
  | 'NEGOTIATING' 
  | 'CONNECTING' 
  | 'CONNECTED' 
  | 'IN_CALL' 
  | 'RECONNECTING' 
  | 'ENDING' 
  | 'ENDED' 
  | 'ERROR';

export interface QualityMetrics {
    signalStrength: 'EXCELLENT' | 'GOOD' | 'POOR' | 'DISCONNECTED';
    packetLoss: number;
    bitrate: number;
    resolution: string;
    fps: number;
    latency: number;
}
