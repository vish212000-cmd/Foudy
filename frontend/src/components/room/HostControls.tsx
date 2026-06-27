import React from 'react';
import { roomService } from '../../services/RoomService';

export const HostControls: React.FC<{ roomId: string }> = ({ roomId }) => {
  
  const handleLock = () => {
    roomService.toggleLock(roomId, true).catch(console.error);
  };

  const handleUnlock = () => {
    roomService.toggleLock(roomId, false).catch(console.error);
  };

  return (
    <div className="p-4 border-t border-gray-800 bg-gray-900">
      <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Host Controls</h3>
      <div className="flex flex-col gap-2">
        <button 
          onClick={handleLock}
          className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors">
          Lock Room
        </button>
        <button 
          onClick={handleUnlock}
          className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-medium transition-colors">
          Unlock Room
        </button>
      </div>
    </div>
  );
};
