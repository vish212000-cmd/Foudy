import React from 'react';
import { useGroupStore } from '../../store/group';

export const ConnectionOverlay: React.FC = () => {
    const error = useGroupStore(state => state.error);
    const callState = useGroupStore(state => state.callState);

    if (callState === 'RECONNECTING') {
        return (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-50">
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                <h2 className="text-xl font-bold">Reconnecting...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-xl z-50">
                {error}
            </div>
        );
    }

    return null;
};
