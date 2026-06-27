import React from 'react';

export const HostControls: React.FC = () => {
    return (
        <div className="flex gap-2 border-l border-gray-600 pl-4 ml-2">
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">
                Mute All
            </button>
            <button className="px-4 py-2 bg-red-800 hover:bg-red-700 rounded-lg text-sm">
                End Call for All
            </button>
        </div>
    );
};
