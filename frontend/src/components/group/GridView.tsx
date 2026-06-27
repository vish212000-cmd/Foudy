import React from 'react';
import { useGroupStore } from '../../store/group';
import { ParticipantCard } from './ParticipantCard';
import { LayoutManager } from '../../services/group/LayoutManager';

export const GridView: React.FC = () => {
    const participants = useGroupStore(state => Object.values(state.participants));
    const layoutClass = LayoutManager.getGridLayout(participants.length);

    return (
        <div className={`w-full h-full p-4 gap-4 grid ${layoutClass}`}>
            {participants.map(p => (
                <ParticipantCard key={p.userId} participant={p} />
            ))}
        </div>
    );
};
