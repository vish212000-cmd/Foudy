export class GroupQualityMonitor {
    private intervalId: number | null = null;
    private getPeers: () => Map<number, RTCPeerConnection>;

    constructor(getPeers: () => Map<number, RTCPeerConnection>) {
        this.getPeers = getPeers;
    }

    public startMonitoring() {
        this.intervalId = window.setInterval(() => this.checkQuality(), 3000);
    }

    private async checkQuality() {
        const peers = this.getPeers();
        for (const [_userId, pc] of peers.entries()) {
            if (pc.connectionState !== 'connected') continue;
            const stats = await pc.getStats();
            // Implement bandwidth estimation and resolution downgrade.
            // Example stub for mesh topology constraints.
            let fractionLost = 0;
            stats.forEach(report => {
                if (report.type === 'inbound-rtp' && report.kind === 'video') {
                    fractionLost = report.packetsLost / (report.packetsReceived + report.packetsLost);
                }
            });

            if (fractionLost > 0.1) {
                // Highly lossy connection, we should lower the encodings on senders if possible
                this.downgradeBitrate(pc);
            }
        }
    }

    private downgradeBitrate(pc: RTCPeerConnection) {
        pc.getSenders().forEach(sender => {
            if (sender.track?.kind === 'video') {
                const parameters = sender.getParameters();
                if (!parameters.encodings) {
                    parameters.encodings = [{}];
                }
                // Cap bitrate at 300kbps for degraded mesh connections
                parameters.encodings[0].maxBitrate = 300000; 
                parameters.encodings[0].scaleResolutionDownBy = 2; // Downgrade res
                sender.setParameters(parameters).catch(e => console.warn(e));
            }
        });
    }

    public stopMonitoring() {
        if (this.intervalId) {
            window.clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}
