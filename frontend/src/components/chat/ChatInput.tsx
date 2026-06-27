import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { EmojiPicker } from './EmojiPicker';
import { ChatService } from '../../services/ChatService';

export const ChatInput: React.FC = () => {
    const [text, setText] = useState('');
    const chatService = useRef(new ChatService());
    const typingTimeout = useRef<NodeJS.Timeout | null>(null);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value);

        chatService.current.sendTyping();
        
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        
        typingTimeout.current = setTimeout(() => {
            chatService.current.sendStopTyping();
        }, 2000);
    };

    const handleSend = () => {
        if (!text.trim()) return;
        chatService.current.sendMessage(text.trim());
        setText('');
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        chatService.current.sendStopTyping();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    useEffect(() => {
        return () => {
            if (typingTimeout.current) clearTimeout(typingTimeout.current);
        };
    }, []);

    return (
        <div className="p-3 bg-gray-900 border-t border-gray-800 flex items-center gap-2">
            <EmojiPicker />
            <input
                type="text"
                value={text}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                maxLength={1000}
                className="flex-1 bg-gray-800 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
                onClick={handleSend}
                disabled={!text.trim()}
                className="p-2 bg-blue-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-full transition-colors"
            >
                <Send size={18} />
            </button>
        </div>
    );
};
