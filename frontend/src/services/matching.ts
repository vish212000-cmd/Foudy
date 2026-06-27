import api from './api';

export const MatchingService = {
    async joinQueue() {
        const response = await api.post('/matching/join/');
        return response.data;
    },

    async leaveQueue() {
        const response = await api.post('/matching/leave/');
        return response.data;
    }
};
