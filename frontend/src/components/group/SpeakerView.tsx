import React from 'react';
import { useGroupStore } from '../../store/group';
import { ParticipantCard } from './ParticipantCard';

export const SpeakerView: React.FC = () => {
    const participants = useGroupStore(state => Object.values(state.participants));
    const activeSpeakerId = useGroupStore(state => state.activeSpeakerId);
    
    const activeSpeaker = participants.find(p => p.userId === activeSpeakerId) || participants[0];
    const others = participants.filter(p => p.userId !== activeSpeaker?.userId);

    return (
        <div className="w-full h-full flex flex-col md:flex-row p-4 gap-4">
            <div className="flex-grow relative bg-black rounded-lg overflow-hidden">
                {activeSpeaker && <ParticipantCard participant={activeSpeaker} isMain />}
            </div>
            
            <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto md:w-64 h-32 md:h-full">
                {others.map(p => (
                    <div key={p.userId} className="w-48 md:w-full h-32 md:h-48 flex-shrink-0">
                        <ParticipantCard participant={p} />
                    </div>
                ))}
            </div>
        </div>
    );
};
