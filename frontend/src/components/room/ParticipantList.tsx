import React from 'react';
import { useRoomStore } from '../../store/room';
import type { RoomParticipant } from '../../types/room';

export const ParticipantCard: React.FC<{ participant: RoomParticipant }> = ({ participant }) => {
  const isHost = participant.role === 'HOST';
  
  return (
    <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg mb-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
          {participant.avatarUrl && <img src={participant.avatarUrl} alt={participant.username} />}
        </div>
        <div>
          <p className="font-medium text-white">{participant.username} {isHost && '👑'}</p>
          <p className="text-xs text-gray-400">{participant.state}</p>
        </div>
      </div>
      {/* Host actions could go here */}
    </div>
  );
};

export const ParticipantList: React.FC = () => {
  const participants = useRoomStore(state => state.participants);
  const activeIds = useRoomStore(state => state.activeParticipantIds);
  
  return (
    <div className="p-4 flex flex-col h-full">
      <h2 className="text-lg font-semibold mb-4 text-white">Participants ({activeIds.length})</h2>
      <div className="flex-1 overflow-y-auto">
        {activeIds.map(id => (
          <ParticipantCard key={id} participant={participants[id]} />
        ))}
      </div>
    </div>
  );
};
