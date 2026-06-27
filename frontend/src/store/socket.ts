import { create } from 'zustand';

export type ConnectionState = 'offline' | 'connecting' | 'connected' | 'reconnecting';

interface SocketState {
    status: ConnectionState;
    lastEvent: { event: string; payload: any } | null;
    setStatus: (status: ConnectionState) => void;
    setLastEvent: (event: string, payload: any) => void;
    sendMessage: (event: string, payload: any) => void;
    setSendMessage: (fn: (event: string, payload: any) => void) => void;
}

export const useSocketStore = create<SocketState>((set) => ({
    status: 'offline',
    lastEvent: null,
    sendMessage: () => {},
    setStatus: (status) => set({ status }),
    setLastEvent: (event, payload) => set({ lastEvent: { event, payload } }),
    setSendMessage: (fn) => set({ sendMessage: fn }),
}));
