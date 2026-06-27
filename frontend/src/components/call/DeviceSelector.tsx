import React from 'react';
import { useMediaStore } from '../../store/media';
import { useConnectionState } from '../../providers/ConnectionStateProvider';
import { Settings } from 'lucide-react';

export const DeviceSelector: React.FC = () => {
    const { devices, activeCameraId, activeMicrophoneId } = useMediaStore();
    const { mediaService } = useConnectionState();

    if (!devices.videoinput.length && !devices.audioinput.length) return null;

    return (
        <div className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-2xl flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-400 font-medium pb-2 border-b border-gray-800">
                <Settings size={16} />
                Device Settings
            </div>
            
            {devices.videoinput.length > 0 && (
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 uppercase tracking-wider">Camera</label>
                    <select
                        className="bg-gray-800 text-white text-sm rounded-lg border-none py-2 px-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={activeCameraId || ''}
                        onChange={(e) => mediaService?.switchCamera(e.target.value)}
                    >
                        {devices.videoinput.map((device) => (
                            <option key={device.deviceId} value={device.deviceId}>
                                {device.label || `Camera ${device.deviceId.slice(0, 5)}`}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {devices.audioinput.length > 0 && (
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 uppercase tracking-wider">Microphone</label>
                    <select
                        className="bg-gray-800 text-white text-sm rounded-lg border-none py-2 px-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={activeMicrophoneId || ''}
                        onChange={() => {
                            // Implement switchMicrophone in MediaService later if needed. 
                            // For now, restarting local media handles it or we can add switchMicrophone method.

                        }}
                    >
                        {devices.audioinput.map((device) => (
                            <option key={device.deviceId} value={device.deviceId}>
                                {device.label || `Mic ${device.deviceId.slice(0, 5)}`}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
};
