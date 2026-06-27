import React from 'react';
import { ParticipantList } from './ParticipantList';
import { RoomSidebar } from './RoomLayout';

export const RoomLobby: React.FC<{ onJoin: () => void }> = ({ onJoin }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-black text-white">
      <h1 className="text-3xl font-bold mb-6">Join Room</h1>
      <button 
        onClick={onJoin}
        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-lg">
        Enter Room
      </button>
    </div>
  );
};

export const RoomWaitingScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-black text-white">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
      <h2 className="text-xl font-semibold">Waiting for host...</h2>
    </div>
  );
};

export const RoomActiveScreen: React.FC = () => {
  return (
    <div className="flex h-full w-full">
      <div className="flex-1 flex items-center justify-center bg-gray-950">
        <p className="text-gray-500">Media area (Group calls to be implemented in next phase)</p>
      </div>
      <RoomSidebar>
        <ParticipantList />
      </RoomSidebar>
    </div>
  );
};
