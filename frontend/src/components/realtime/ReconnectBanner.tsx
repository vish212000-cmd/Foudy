import React from 'react';
import { useSocketStore } from '../../store/socket';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Text } from '../ui/Text';

export const ReconnectBanner: React.FC = () => {
    const { status } = useSocketStore();
    
    if (status === 'offline') {
        return (
            <div className="bg-red-500 text-white p-2 text-center flex items-center justify-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <Text variant="caption">You are offline. Please check your connection.</Text>
            </div>
        );
    }
    
    if (status === 'reconnecting' || status === 'connecting') {
        return (
            <div className="bg-yellow-500 text-black p-2 text-center flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <Text variant="caption">Reconnecting to servers...</Text>
            </div>
        );
    }
    
    return null;
};
