import React from 'react';
import { useGroupStore } from '../../store/group';
import { SpeakerView } from './SpeakerView';
import { GridView } from './GridView';
import { GroupCallControls } from './GroupCallControls';
import { GroupStatusBar } from './GroupStatusBar';
import { ConnectionOverlay } from './ConnectionOverlay';

export const GroupVideoLayout: React.FC = () => {
    const participants = useGroupStore(state => state.participants);
    const activeSpeakerId = useGroupStore(state => state.activeSpeakerId);
    
    const count = Object.keys(participants).length;
    // Default to Speaker view if >= 3 participants, otherwise Grid
    const useSpeakerView = count >= 3 && activeSpeakerId !== null;

    return (
        <div className="relative w-full h-screen bg-gray-950 text-white overflow-hidden flex flex-col">
            <GroupStatusBar />
            
            <div className="flex-grow relative">
                {useSpeakerView ? <SpeakerView /> : <GridView />}
            </div>

            <GroupCallControls />
            <ConnectionOverlay />
        </div>
    );
};
