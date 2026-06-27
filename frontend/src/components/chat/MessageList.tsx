import React, { useRef, useEffect } from 'react';
import { useChatStore } from '../../store/chat';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

export const MessageList: React.FC = () => {
    const { messages, isPeerTyping } = useChatStore();
    const endRef = useRef<HTMLDivElement>(null);

    // ScrollManager embedded: auto scroll to bottom on new messages
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isPeerTyping]);

    return (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col bg-gray-950 scrollbar-thin scrollbar-thumb-gray-800">
            {messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                    No messages yet. Say hello!
                </div>
            ) : (
                messages.map(msg => (
                    <MessageBubble key={msg.id} message={msg} />
                ))
            )}
            
            {isPeerTyping && (
                <div className="mb-2">
                    <TypingIndicator />
                </div>
            )}
            
            <div ref={endRef} />
        </div>
    );
};
