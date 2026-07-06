import { create } from 'zustand';
import type { User } from '../services/auth';
import { AuthService } from '../services/auth';

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    
    setCredentials: (user: User, accessToken: string) => void;
    setAccessToken: (accessToken: string) => void;
    updateUser: (user: User) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true, // Start as true while we check auth
    error: null,

    setCredentials: (user, accessToken) => {
        localStorage.setItem('token', accessToken);
        set({ 
            user, 
            accessToken, 
            isAuthenticated: true,
            isLoading: false,
            error: null
        });
    },
    
    setAccessToken: (accessToken) => {
        localStorage.setItem('token', accessToken);
        set({ accessToken });
    },
    
    updateUser: (user) => set({ user }),

    logout: () => {
        localStorage.removeItem('token');
        set({ 
            user: null, 
            accessToken: null, 
            isAuthenticated: false,
            isLoading: false
        });
    },

    checkAuth: async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                set({ 
                    isLoading: false, 
                    isAuthenticated: false,
                    user: null,
                    accessToken: null
                });
                return;
            }

            set({ isLoading: true, error: null });
            
            // First we attempt to hit the /me endpoint
            // Our interceptor will handle the refresh if we don't have an access token
            // or if the access token is expired.
            const user = await AuthService.fetchCurrentUser();
            
            set({ 
                user, 
                accessToken: token,   // ← restore from localStorage so RealtimeProvider can connect
                isAuthenticated: true, 
                isLoading: false 
            });
        } catch {
            // If it fails, they are fully logged out. Interceptor handles purging state.
            set({ 
                user: null,
                accessToken: null,
                isAuthenticated: false, 
                isLoading: false 
            });
        }
    }
}));
