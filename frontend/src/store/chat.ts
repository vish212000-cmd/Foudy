import { create } from 'zustand';
import type { ChatStore } from '../types/chat';

export const useChatStore = create<ChatStore>((set) => ({
    messages: [],
    isPeerTyping: false,
    unreadCount: 0,

    addMessage: (message) => set((state) => {
        // Prevent duplicate insertions
        if (state.messages.some(m => m.id === message.id)) {
            return state;
        }
        // Keep only last 200 messages in memory to prevent unbounded growth
        const newMessages = [...state.messages, message];
        if (newMessages.length > 200) {
            newMessages.shift();
        }
        return { messages: newMessages };
    }),

    updateMessageState: (id, messageState) => set((state) => ({
        messages: state.messages.map(msg => 
            msg.id === id ? { ...msg, state: messageState } : msg
        )
    })),

    setPeerTyping: (isTyping) => set({ isPeerTyping: isTyping }),

    incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),

    resetUnread: () => set({ unreadCount: 0 }),

    clearChat: () => set({
        messages: [],
        isPeerTyping: false,
        unreadCount: 0
    })
}));
