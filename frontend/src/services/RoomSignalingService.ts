import { useRoomStore } from '../store/room';

export class RoomSignalingService {
  private ws: WebSocket | null = null;
  private readonly store = useRoomStore.getState();

  attachWebSocket(ws: WebSocket) {
    this.ws = ws;
  }

  handleEvent(event: any) {
    const { event: eventName, data } = event;

    switch (eventName) {
      case 'room.updated':
        if (data.state) this.store.updateRoomState(data.state);
        break;
      case 'room.locked':
        this.store.setLocked(true);
        break;
      case 'room.unlocked':
        this.store.setLocked(false);
        break;
      case 'room.closed':
      case 'room.destroyed':
        this.store.updateRoomState('CLOSED');
        // Might want to clear room or show disconnected UI
        break;
      case 'participant.joined':
        this.store.addParticipant(data.participant);
        break;
      case 'participant.left':
        this.store.removeParticipant(data.userId);
        break;
      case 'participant.removed':
        this.store.removeParticipant(data.userId);
        break;
      case 'participant.updated':
        this.store.updateParticipantState(data.userId, data.state);
        break;
      case 'host.changed':
        // Update host locally if needed, can trigger a re-fetch or use data
        if (this.store.room) {
          this.store.setRoom({ ...this.store.room, hostId: data.hostId });
        }
        break;
      default:
        console.warn('Unhandled room event:', eventName);
    }
  }

  joinRoom(roomId: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({
      event: 'room.join',
      payload: { roomId }
    }));
  }

  leaveRoom(roomId: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({
      event: 'room.leave',
      payload: { roomId }
    }));
  }
}

export const roomSignalingService = new RoomSignalingService();
