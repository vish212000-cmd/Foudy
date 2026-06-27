export interface SocketService {
    on: (event: string, cb: any) => void;
    send: (event: string, payload: any) => void;
}
import { usePresenceStore } from '../store/presence';
import type { PresenceState } from '../store/presence';

export class PresenceService {
    private socketService: SocketService;

    constructor(socketService: SocketService) {
        this.socketService = socketService;
        this.socketService.on('presence.update', this.handlePresenceUpdate.bind(this));
        this.socketService.on('presence.friend_update', this.handleFriendUpdate.bind(this));
    }

    private handlePresenceUpdate(payload: { state: PresenceState }) {
        usePresenceStore.getState().setLocalState(payload.state);
    }

    private handleFriendUpdate(payload: { user_id: number; state: PresenceState }) {
        usePresenceStore.getState().setFriendState(payload.user_id, payload.state);
    }

    public setAway() {
        this.socketService.send('presence.set_away', {});
    }

    public setOnline() {
        this.socketService.send('presence.set_online', {});
    }
}
