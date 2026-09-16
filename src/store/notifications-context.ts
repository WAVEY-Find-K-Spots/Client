import { createContext, useContext } from "react";
import type {
  NotificationItem,
  NotificationSettings,
  NotificationSettingsPatch,
  NotificationType,
} from "@/lib/notifications-api";

export type NotifType = NotificationType;
export type AppNotification = NotificationItem;

export interface NotificationsContextValue {
  items: AppNotification[];
  unreadCount: number;
  loading: boolean;
  loadingMore: boolean;
  hasNext: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
  notificationSettings: NotificationSettings | null;
  settingsLoading: boolean;
  settingsUpdating: boolean;
  settingsError: string | null;
  updateNotificationSettings: (
    patch: NotificationSettingsPatch,
  ) => Promise<void>;
}

export const NotificationsContext =
  createContext<NotificationsContextValue | null>(null);

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within <NotificationsProvider>");
  }
  return ctx;
}
