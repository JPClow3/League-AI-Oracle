import { create } from 'zustand';

export type NotificationType = 'counterIntel' | 'contextualTip' | 'genericInfo';

export interface Notification {
    id: string;
    type: NotificationType;
    payload: any;
    title?: string;
    duration?: number; // Auto-dismiss duration in ms
}

interface NotificationStore {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id'>) => string;
    removeNotification: (id: string) => void;
    clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
    notifications: [],
    addNotification: (notification) => {
        const id = new Date().getTime().toString() + Math.random();
        const newNotification = { ...notification, id };
        set(state => ({ notifications: [...state.notifications, newNotification] }));

        if (notification.duration) {
            setTimeout(() => {
                get().removeNotification(id);
            }, notification.duration);
        }
        return id;
    },
    removeNotification: (id) => {
        set(state => ({
            notifications: state.notifications.filter(n => n.id !== id),
        }));
    },
    clearAll: () => set({ notifications: [] }),
}));
