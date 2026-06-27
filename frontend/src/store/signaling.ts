import { create } from 'zustand';
import type { SignalingState } from '../types/signaling';

interface SignalingStoreState {
  state: SignalingState;
  matchId: string | null;
  targetUserId: string | null;
  pendingMessages: Map<string, { event: string, payload: any, timestamp: number }>;
  
  setState: (state: SignalingState) => void;
  setMatchContext: (matchId: string, targetUserId: string) => void;
  addPendingMessage: (correlationId: string, event: string, payload: any) => void;
  resolvePendingMessage: (correlationId: string) => void;
  clearSession: () => void;
}

export const useSignalingStore = create<SignalingStoreState>((set) => ({
  state: 'CLOSED',
  matchId: null,
  targetUserId: null,
  pendingMessages: new Map(),
  
  setState: (state) => set({ state }),
  
  setMatchContext: (matchId, targetUserId) => set({ matchId, targetUserId }),
  
  addPendingMessage: (correlationId, event, payload) => set((prev) => {
    const newMap = new Map(prev.pendingMessages);
    newMap.set(correlationId, { event, payload, timestamp: Date.now() });
    return { pendingMessages: newMap };
  }),
  
  resolvePendingMessage: (correlationId) => set((prev) => {
    const newMap = new Map(prev.pendingMessages);
    newMap.delete(correlationId);
    return { pendingMessages: newMap };
  }),
  
  clearSession: () => set({
    state: 'CLOSED',
    matchId: null,
    targetUserId: null,
    pendingMessages: new Map()
  })
}));
