import { create } from 'zustand';

export type PresenceState = 
    | 'ONLINE' | 'OFFLINE' | 'MATCHING' | 'IN_CALL' 
    | 'IN_ROOM' | 'AWAY' | 'RECONNECTING' | 'DISCONNECTED';

interface PresenceStore {
    localState: PresenceState;
    friendsState: Record<number, PresenceState>;
    
    setLocalState: (state: PresenceState) => void;
    setFriendState: (userId: number, state: PresenceState) => void;
}

export const usePresenceStore = create<PresenceStore>((set) => ({
    localState: 'OFFLINE',
    friendsState: {},
    
    setLocalState: (state) => set({ localState: state }),
    setFriendState: (userId, state) => set((store) => ({
        friendsState: { ...store.friendsState, [userId]: state }
    }))
}));
