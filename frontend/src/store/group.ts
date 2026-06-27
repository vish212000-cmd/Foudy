import { create } from 'zustand';

export type GroupCallState = 
    | 'INITIALIZING' | 'JOINING' | 'NEGOTIATING' | 'CONNECTED'
    | 'ACTIVE' | 'PARTICIPANT_JOINING' | 'PARTICIPANT_LEAVING'
    | 'RECONNECTING' | 'ENDING' | 'ENDED' | 'ERROR';

export type ParticipantState = 
    | 'JOINING' | 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING' | 'LEFT';

export interface GroupParticipant {
    userId: number;
    state: ParticipantState;
    isMuted: boolean;
    isCameraOff: boolean;
    isScreenSharing: boolean;
    isSpeaking: boolean;
    stream: MediaStream | null;
}

interface GroupStore {
    callState: GroupCallState;
    participants: Record<number, GroupParticipant>;
    activeSpeakerId: number | null;
    error: string | null;

    setCallState: (state: GroupCallState) => void;
    addParticipant: (userId: number) => void;
    updateParticipant: (userId: number, update: Partial<GroupParticipant>) => void;
    removeParticipant: (userId: number) => void;
    setActiveSpeaker: (userId: number | null) => void;
    setError: (error: string | null) => void;
    reset: () => void;
}

export const useGroupStore = create<GroupStore>((set) => ({
    callState: 'INITIALIZING',
    participants: {},
    activeSpeakerId: null,
    error: null,

    setCallState: (state) => set({ callState: state }),
    
    addParticipant: (userId) => set((state) => {
        if (state.participants[userId]) return state; // Already exists
        return {
            participants: {
                ...state.participants,
                [userId]: {
                    userId,
                    state: 'JOINING',
                    isMuted: false,
                    isCameraOff: false,
                    isScreenSharing: false,
                    isSpeaking: false,
                    stream: null
                }
            }
        };
    }),

    updateParticipant: (userId, update) => set((state) => {
        const participant = state.participants[userId];
        if (!participant) return state;
        return {
            participants: {
                ...state.participants,
                [userId]: { ...participant, ...update }
            }
        };
    }),

    removeParticipant: (userId) => set((state) => {
        const { [userId]: _, ...rest } = state.participants;
        return { participants: rest };
    }),

    setActiveSpeaker: (userId) => set({ activeSpeakerId: userId }),
    setError: (error) => set({ error }),
    reset: () => set({
        callState: 'INITIALIZING',
        participants: {},
        activeSpeakerId: null,
        error: null
    })
}));
