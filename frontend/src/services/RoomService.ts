import type { RoomMetadata, RoomParticipant } from '../types/room';

class RoomService {
  private baseUrl = '/api/v1/rooms';

  async createRoom(maxParticipants = 10, settings = {}): Promise<RoomMetadata> {
    const res = await fetch(`${this.baseUrl}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ maxParticipants, settings })
    });
    if (!res.ok) throw new Error('Failed to create room');
    return res.json();
  }

  async getRoom(roomId: string): Promise<{ room: RoomMetadata, participants: RoomParticipant[] }> {
    const res = await fetch(`${this.baseUrl}/${roomId}`);
    if (!res.ok) throw new Error('Failed to fetch room');
    return res.json();
  }

  async generateInvite(roomId: string, ttl = 86400): Promise<{ code: string }> {
    const res = await fetch(`${this.baseUrl}/${roomId}/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ttl })
    });
    if (!res.ok) throw new Error('Failed to generate invite');
    return res.json();
  }

  async resolveInvite(code: string): Promise<{ roomId: string }> {
    const res = await fetch(`${this.baseUrl}/invite/${code}`);
    if (!res.ok) throw new Error('Invalid or expired invite');
    return res.json();
  }

  async kickParticipant(roomId: string, userId: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${roomId}/participants/${userId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to kick participant');
  }

  async toggleLock(roomId: string, isLocked: boolean): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${roomId}/lock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isLocked })
    });
    if (!res.ok) throw new Error('Failed to toggle lock');
  }

  async transferHost(roomId: string, newHostId: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${roomId}/host`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hostId: newHostId })
    });
    if (!res.ok) throw new Error('Failed to transfer host');
  }
}

export const roomService = new RoomService();
