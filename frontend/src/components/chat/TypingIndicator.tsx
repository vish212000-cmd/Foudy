import React from 'react';

export const TypingIndicator: React.FC = () => {
    return (
        <div className="flex items-center gap-1 p-2 bg-gray-800 rounded-2xl rounded-bl-none w-16 h-8">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
    );
};
