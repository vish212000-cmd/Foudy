import React from 'react';
import type { ChatMessage } from '../../types/chat';
import { Check, CheckCheck, AlertCircle, Clock } from 'lucide-react';

interface Props {
    message: ChatMessage;
}

export const MessageBubble: React.FC<Props> = ({ message }) => {
    const isMe = message.senderId === 'me';

    const renderStatus = () => {
        if (!isMe) return null;
        switch (message.state) {
            case 'SENDING':
                return <Clock size={12} className="text-gray-400" />;
            case 'SENT':
                return <Check size={12} className="text-gray-400" />;
            case 'DELIVERED':
                return <CheckCheck size={12} className="text-blue-400" />;
            case 'FAILED':
                return <AlertCircle size={12} className="text-red-500" />;
            default:
                return null;
        }
    };

    return (
        <div className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} mb-3`}>
            <div
                className={`max-w-[75%] px-4 py-2 flex flex-col gap-1 ${
                    isMe
                        ? 'bg-blue-600 text-white rounded-2xl rounded-br-none'
                        : 'bg-gray-800 text-gray-100 rounded-2xl rounded-bl-none'
                }`}
            >
                {/* Decode escaped HTML if needed, but textContent handles it safely */}
                <span className="text-sm break-words whitespace-pre-wrap leading-relaxed">
                    {message.content}
                </span>
                
                <div className={`flex items-center gap-1 text-[10px] ${isMe ? 'justify-end text-blue-200' : 'justify-start text-gray-400'}`}>
                    <span>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {renderStatus()}
                </div>
            </div>
        </div>
    );
};
