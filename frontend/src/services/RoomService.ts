import api from './api';
import type { RoomMetadata, RoomParticipant } from '../types/room';

class RoomService {
  private baseUrl = '/rooms';

  async getRooms(): Promise<RoomMetadata[]> {
    const res = await api.get(`${this.baseUrl}/`);
    return res.data;
  }

  async createRoom(maxParticipants = 10, settings = {}): Promise<RoomMetadata> {
    const res = await api.post(`${this.baseUrl}/`, { maxParticipants, settings });
    return res.data;
  }

  async getRoom(roomId: string): Promise<{ room: RoomMetadata, participants: RoomParticipant[] }> {
    const res = await api.get(`${this.baseUrl}/${roomId}/`);
    return res.data;
  }

  async generateInvite(roomId: string, ttl = 86400): Promise<{ code: string }> {
    const res = await api.post(`${this.baseUrl}/${roomId}/invite/`, { ttl });
    return res.data;
  }

  async resolveInvite(code: string): Promise<{ roomId: string }> {
    const res = await api.get(`${this.baseUrl}/invite/${code}/`);
    return res.data;
  }

  async kickParticipant(roomId: string, userId: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${roomId}/participants/${userId}/`);
  }

  async toggleLock(roomId: string, isLocked: boolean): Promise<void> {
    await api.post(`${this.baseUrl}/${roomId}/lock/`, { isLocked });
  }

  async transferHost(roomId: string, newHostId: string): Promise<void> {
    await api.post(`${this.baseUrl}/${roomId}/host/`, { hostId: newHostId });
  }
}

export const roomService = new RoomService();
