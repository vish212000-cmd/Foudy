import api from './api';
import type { BlockedUser, ReportPayload } from '../types/moderation';

export const ModerationService = {
    async blockUser(userId: number): Promise<void> {
        await api.post(`/api/moderation/block/${userId}/`);
    },

    async unblockUser(userId: number): Promise<void> {
        await api.post(`/api/moderation/unblock/${userId}/`);
    },

    async reportUser(userId: number, payload: ReportPayload): Promise<void> {
        await api.post(`/api/moderation/report/${userId}/`, payload);
    },

    async getBlockedUsers(): Promise<BlockedUser[]> {
        const response = await api.get<BlockedUser[]>('/api/moderation/blocks/');
        return response.data;
    }
};
