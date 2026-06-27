import { create } from 'zustand';

export type NotificationType = 
    | 'MATCH' | 'MATCH_CANCELLED' | 'ROOM_INVITE' | 'ROOM_JOINED'
    | 'ROOM_CLOSED' | 'HOST_CHANGED' | 'PARTICIPANT_JOINED' 
    | 'PARTICIPANT_LEFT' | 'RECONNECT_SUCCESS' | 'RECONNECT_FAILED'
    | 'MEDIA_PERMISSION_REQUIRED' | 'USER_BLOCKED' | 'USER_REPORTED' | 'SYSTEM_NOTICE';

export interface AppNotification {
    id: number;
    type: NotificationType;
    content: string;
    payload: any;
    created_at: string;
    is_read: boolean;
}

interface NotificationStore {
    notifications: AppNotification[];
    unreadCount: number;
    
    addNotification: (notification: AppNotification) => void;
    markAsRead: (id: number) => void;
    markAllAsRead: () => void;
    setNotifications: (notifications: AppNotification[]) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
    notifications: [],
    unreadCount: 0,
    
    addNotification: (notification) => set((state) => {
        const newNotifications = [notification, ...state.notifications];
        return {
            notifications: newNotifications,
            unreadCount: state.unreadCount + 1
        };
    }),
    
    markAsRead: (id) => set((state) => {
        const updated = state.notifications.map(n => 
            n.id === id ? { ...n, is_read: true } : n
        );
        const newlyRead = state.notifications.find(n => n.id === id && !n.is_read);
        return {
            notifications: updated,
            unreadCount: newlyRead ? state.unreadCount - 1 : state.unreadCount
        };
    }),

    markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, is_read: true })),
        unreadCount: 0
    })),

    setNotifications: (notifications) => set({
        notifications,
        unreadCount: notifications.filter(n => !n.is_read).length
    })
}));
