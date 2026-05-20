import { create } from 'zustand'

interface Notification {
  id: string
  type: 'booking' | 'cafe_order' | 'contact' | 'system'
  title: string
  message: string
  read: boolean
  createdAt: string
  link?: string
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  addNotification: (n: Notification) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  setNotifications: (n: Notification[]) => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (n) => {
    set({
      notifications: [n, ...get().notifications],
      unreadCount: get().unreadCount + 1,
    })
  },
  markAsRead: (id) => {
    set({
      notifications: get().notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, get().unreadCount - 1),
    })
  },
  markAllAsRead: () => {
    set({
      notifications: get().notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })
  },
  setNotifications: (notifications) => {
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    })
  },
}))
