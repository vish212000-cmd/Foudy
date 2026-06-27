import { create } from 'zustand';
import type { RoomMetadata, RoomParticipant, RoomState } from '../types/room';

interface RoomStore {
  room: RoomMetadata | null;
  participants: Record<string, RoomParticipant>;
  activeParticipantIds: string[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setRoom: (room: RoomMetadata) => void;
  updateRoomState: (state: RoomState) => void;
  setLocked: (isLocked: boolean) => void;
  
  addParticipant: (participant: RoomParticipant) => void;
  updateParticipantState: (userId: string, state: RoomParticipant['state']) => void;
  removeParticipant: (userId: string) => void;
  setParticipants: (participants: RoomParticipant[]) => void;
  
  clearRoom: () => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  room: null,
  participants: {},
  activeParticipantIds: [],
  isLoading: false,
  error: null,

  setRoom: (room) => set({ room, error: null }),
  
  updateRoomState: (state) => set((store) => ({
    room: store.room ? { ...store.room, state } : null
  })),
  
  setLocked: (isLocked) => set((store) => ({
    room: store.room ? { ...store.room, isLocked } : null
  })),

  addParticipant: (participant) => set((store) => {
    const updatedParticipants = { ...store.participants, [participant.userId]: participant };
    const activeIds = Object.values(updatedParticipants)
      .filter(p => ['ACTIVE', 'JOINING', 'WAITING', 'RECONNECTING'].includes(p.state))
      .map(p => p.userId);
    return { participants: updatedParticipants, activeParticipantIds: activeIds };
  }),

  updateParticipantState: (userId, state) => set((store) => {
    const p = store.participants[userId];
    if (!p) return store;
    
    const updatedParticipants = { ...store.participants, [userId]: { ...p, state } };
    const activeIds = Object.values(updatedParticipants)
      .filter(p => ['ACTIVE', 'JOINING', 'WAITING', 'RECONNECTING'].includes(p.state))
      .map(p => p.userId);
      
    return { participants: updatedParticipants, activeParticipantIds: activeIds };
  }),

  removeParticipant: (userId) => set((store) => {
    const { [userId]: _removed, ...rest } = store.participants;
    const activeIds = store.activeParticipantIds.filter(id => id !== userId);
    return { participants: rest, activeParticipantIds: activeIds };
  }),

  setParticipants: (participants) => set(() => {
    const dict: Record<string, RoomParticipant> = {};
    const activeIds: string[] = [];
    
    participants.forEach(p => {
      dict[p.userId] = p;
      if (['ACTIVE', 'JOINING', 'WAITING', 'RECONNECTING'].includes(p.state)) {
        activeIds.push(p.userId);
      }
    });
    
    return { participants: dict, activeParticipantIds: activeIds };
  }),

  clearRoom: () => set({ room: null, participants: {}, activeParticipantIds: [], error: null }),
  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),
}));
