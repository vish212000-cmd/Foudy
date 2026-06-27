export interface SocketService {
    on: (event: string, cb: any) => void;
    send: (event: string, payload: any) => void;
}
import { useNotificationStore } from '../store/notifications';
import type { AppNotification } from '../store/notifications';

export class NotificationService {
    private socketService: SocketService;

    constructor(socketService: SocketService) {
        this.socketService = socketService;
        this.socketService.on('notification.new', this.handleNewNotification.bind(this));
        this.socketService.on('notification.marked_read', this.handleMarkedRead.bind(this));
        this.socketService.on('notification.all_marked_read', this.handleAllMarkedRead.bind(this));
    }

    private handleNewNotification(payload: Omit<AppNotification, 'is_read'>) {
        const notification: AppNotification = { ...payload, is_read: false };
        useNotificationStore.getState().addNotification(notification);
        
        // Dispatch a custom event to trigger ToastNotification in the UI
        window.dispatchEvent(new CustomEvent('new_toast', { detail: notification }));
    }

    private handleMarkedRead(payload: { id: number }) {
        useNotificationStore.getState().markAsRead(payload.id);
    }

    private handleAllMarkedRead() {
        useNotificationStore.getState().markAllAsRead();
    }

    public markAsRead(id: number) {
        this.socketService.send('notification.mark_read', { notification_id: id });
    }

    public markAllAsRead() {
        this.socketService.send('notification.mark_all_read', {});
    }
}
