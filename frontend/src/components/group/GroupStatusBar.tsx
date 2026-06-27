import React from 'react';
import { useGroupStore } from '../../store/group';

export const GroupStatusBar: React.FC = () => {
    const callState = useGroupStore(state => state.callState);
    const count = useGroupStore(state => Object.keys(state.participants).length);

    return (
        <div className="w-full h-12 bg-gray-900 flex items-center justify-between px-6 border-b border-gray-800 shrink-0">
            <div className="flex items-center gap-3">
                <span className="font-bold text-lg">Group Call</span>
                <span className="text-gray-400 text-sm">{callState}</span>
            </div>
            
            <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">
                    {count} / 6 Participants
                </span>
            </div>
        </div>
    );
};
