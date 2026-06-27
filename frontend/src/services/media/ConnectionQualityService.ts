import { useCallStore } from '../../store/call';

export class ConnectionQualityService {
    private pc: RTCPeerConnection;
    private intervalId: number | null = null;

    constructor(pc: RTCPeerConnection) {
        this.pc = pc;
    }

    public startMonitoring() {
        if (this.intervalId) return;

        this.intervalId = window.setInterval(async () => {
            if (this.pc.connectionState !== 'connected') return;

            try {
                const stats = await this.pc.getStats();
                
                let bitrate = 0;
                let fps = 0;
                let resolution = '0x0';
                let packetLoss = 0;
                let latency = 0;
                
                stats.forEach(report => {
                    if (report.type === 'inbound-rtp' && report.kind === 'video') {
                        if (report.packetsReceived > 0) {
                            packetLoss = report.packetsLost / report.packetsReceived;
                        }
                        if (report.frameWidth && report.frameHeight) {
                            resolution = `${report.frameWidth}x${report.frameHeight}`;
                        }
                        fps = report.framesPerSecond || 0;
                        
                        // Roughly estimating bitrate if bytesReceived is present
                        // Need previous values for accurate bitrate, keeping it simple for now
                        bitrate = report.bytesReceived || 0;
                    }
                    if (report.type === 'candidate-pair' && report.state === 'succeeded') {
                        latency = report.currentRoundTripTime ? report.currentRoundTripTime * 1000 : 0;
                    }
                });

                let signalStrength: 'EXCELLENT' | 'GOOD' | 'POOR' | 'DISCONNECTED' = 'GOOD';
                if (packetLoss > 0.1 || latency > 300) {
                    signalStrength = 'POOR';
                } else if (packetLoss < 0.02 && latency < 100) {
                    signalStrength = 'EXCELLENT';
                }

                useCallStore.getState().setQualityMetrics({
                    packetLoss,
                    fps,
                    resolution,
                    latency,
                    signalStrength,
                    bitrate
                });
                
            } catch (err) {
                console.error("Error fetching stats:", err);
            }
        }, 5000);
    }

    public stopMonitoring() {
        if (this.intervalId) {
            window.clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}
