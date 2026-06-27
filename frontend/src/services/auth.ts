import api from './api';

export interface User {
    id: string;
    email: string | null;
    is_guest: boolean;
    profile: {
        display_name: string;
        avatar: string | null;
        bio: string;
        interests: string[];
        keywords: string[];
        languages: string[];
        country: string;
        gender_preference: string;
        privacy_settings: any;
        notification_settings: any;
        completion_score: number;
    };
}

export interface AuthResponse {
    access_token: string;
    user: User;
}

export const AuthService = {
    async register(data: any): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/register/', data);
        return response.data;
    },

    async login(data: any): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/login/', data);
        return response.data;
    },

    async guestLogin(): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/guest/');
        return response.data;
    },

    async logout(): Promise<void> {
        await api.post('/auth/logout/');
    },

    async fetchCurrentUser(): Promise<User> {
        const response = await api.get<User>('/users/me/');
        return response.data;
    },

    async updateProfile(data: any): Promise<User> {
        const response = await api.patch<User>('/users/me/', data);
        return response.data;
    },

    async uploadAvatar(file: File): Promise<User> {
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await api.post<User>('/users/me/avatar/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    async upgradeGuest(data: any): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/upgrade/', data);
        return response.data;
    }
};
