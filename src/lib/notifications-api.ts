import { apiRequest } from "@/lib/auth/api";

export type NotificationType =
  | "stamp"
  | "badge"
  | "route"
  | "spot"
  | "review"
  | "system";

export type NotificationTargetType =
  | "stamp"
  | "badge"
  | "route"
  | "spot"
  | "review"
  | "system";

export interface NotificationItem {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  targetType: NotificationTargetType | null;
  targetId: number | null;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationInbox {
  unreadCount: number;
  notifications: NotificationItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

export interface NotificationSettings {
  pushEnabled: boolean;
  stampEnabled: boolean;
  routeEnabled: boolean;
  spotEnabled: boolean;
  noticeEnabled: boolean;
}

export type NotificationSettingsPatch = Partial<NotificationSettings>;

interface InboxParams {
  language: "ko" | "en";
  page?: number;
  size?: number;
}

export const notificationsApi = {
  getInbox({ language, page = 0, size = 20 }: InboxParams) {
    const query = new URLSearchParams({
      language,
      page: String(page),
      size: String(size),
    });
    return apiRequest<NotificationInbox>(
      `/api/v1/me/notifications?${query.toString()}`,
    );
  },

  markRead(notificationId: number, language: "ko" | "en") {
    const query = new URLSearchParams({ language });
    return apiRequest<NotificationItem>(
      `/api/v1/me/notifications/${notificationId}/read?${query.toString()}`,
      { method: "PATCH" },
    );
  },

  markAllRead() {
    return apiRequest<number>("/api/v1/me/notifications/read-all", {
      method: "PATCH",
    });
  },

  getSettings() {
    return apiRequest<NotificationSettings>("/api/v1/me/notifications/settings");
  },

  updateSettings(payload: NotificationSettingsPatch) {
    return apiRequest<NotificationSettings>("/api/v1/me/notifications/settings", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
};
