import React from 'react';

// Placeholders for modals that would use a Dialog/Modal provider in reality
export const InviteLinkModal: React.FC<{ inviteCode: string; onClose: () => void }> = ({ inviteCode, onClose }) => {
  const link = `${window.location.origin}/room/join/${inviteCode}`;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-white mb-4">Invite Others</h2>
        <div className="flex gap-2 mb-6">
          <input 
            type="text" 
            readOnly 
            value={link} 
            className="flex-1 bg-black border border-gray-700 rounded px-3 py-2 text-white"
          />
          <button 
            onClick={() => navigator.clipboard.writeText(link)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium">
            Copy
          </button>
        </div>
        <div className="flex justify-end">
          <button onClick={onClose} className="text-gray-400 hover:text-white">Close</button>
        </div>
      </div>
    </div>
  );
};
