import { create } from 'zustand';

interface AppState {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
}

export const useAppStore = create<AppState>((set) => ({
    theme: 'dark', // FOUDY defaults to a dark theme context based on Discord/Linear taste
    setTheme: (theme) => set({ theme }),
}));
