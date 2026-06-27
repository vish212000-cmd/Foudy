import React from 'react';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { X } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const ChatPanel: React.FC<Props> = ({ isOpen, onClose }) => {
    return (
        <div 
            className={`absolute right-0 top-0 bottom-0 w-full sm:w-96 bg-gray-900 border-l border-gray-800 z-30 flex flex-col transition-transform duration-300 transform ${
                isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
            <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900">
                <h3 className="text-white font-bold tracking-wide">Chat</h3>
                <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>
            
            <MessageList />
            <ChatInput />
        </div>
    );
};
