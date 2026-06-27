import React from 'react';
import { useRoomStore } from '../../store/room';

export const RoomHeader: React.FC = () => {
  const room = useRoomStore(state => state.room);
  
  return (
    <header className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800 text-white">
      <div>
        <h1 className="text-xl font-bold">Room {room?.id}</h1>
        <div className="flex gap-2 mt-1 text-sm text-gray-400">
          <span>{room?.state}</span>
          {room?.isLocked && <span>• Locked</span>}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {/* Actions like Leave or Invite can go here */}
      </div>
    </header>
  );
};

export const RoomFooter: React.FC = () => {
  return (
    <footer className="flex items-center justify-center p-4 bg-gray-900 border-t border-gray-800">
      <p className="text-sm text-gray-500">Room Controls</p>
    </footer>
  );
};

export const RoomSidebar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <aside className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col">
      {children}
    </aside>
  );
};

export const RoomLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <RoomHeader />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 relative">
          {children}
        </main>
      </div>
      <RoomFooter />
    </div>
  );
};
