import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useCallStore } from '../../store/call';

export const QualityIndicator: React.FC = () => {
    const { signalStrength, packetLoss, latency } = useCallStore(state => state.qualityMetrics);

    let color = 'text-green-500';
    if (signalStrength === 'POOR') color = 'text-yellow-500';
    if (signalStrength === 'DISCONNECTED') color = 'text-red-500';

    return (
        <div className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 flex items-center gap-3 z-10">
            <div className={`flex items-center ${color}`}>
                {signalStrength === 'DISCONNECTED' ? <WifiOff size={18} /> : <Wifi size={18} />}
            </div>
            
            <div className="flex flex-col hidden sm:flex">
                <span className="text-xs font-semibold text-white">
                    {signalStrength}
                </span>
                <span className="text-[10px] text-gray-400">
                    Ping: {latency.toFixed(0)}ms | Loss: {(packetLoss * 100).toFixed(1)}%
                </span>
            </div>
        </div>
    );
};
