export type MessageState = 'SENDING' | 'SENT' | 'DELIVERED' | 'FAILED';

export interface ChatMessage {
    id: string; // UUID or correlationId
    content: string;
    senderId: string;
    timestamp: number;
    state: MessageState;
}

export interface ChatStore {
    messages: ChatMessage[];
    isPeerTyping: boolean;
    unreadCount: number;
    
    addMessage: (message: ChatMessage) => void;
    updateMessageState: (id: string, state: MessageState) => void;
    setPeerTyping: (isTyping: boolean) => void;
    incrementUnread: () => void;
    resetUnread: () => void;
    clearChat: () => void;
}
