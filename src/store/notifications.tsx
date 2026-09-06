import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  NOTIFICATIONS_STORAGE_KEY,
  NotificationsContext,
  SEED_NOTIFICATIONS,
  type NotificationsContextValue,
} from "./notifications-context";

function loadReadIds(): string[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [readIds, setReadIds] = useState<string[]>(loadReadIds);

  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(readIds));
    } catch {
      /* storage unavailable */
    }
  }, [readIds]);

  const markRead = useCallback((id: string) => {
    setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const markAllRead = useCallback(() => {
    setReadIds(SEED_NOTIFICATIONS.map((n) => n.id));
  }, []);

  const value = useMemo<NotificationsContextValue>(() => {
    const items = SEED_NOTIFICATIONS.map((n) => ({
      ...n,
      read: readIds.includes(n.id),
    }));
    return {
      items,
      unreadCount: items.filter((n) => !n.read).length,
      markRead,
      markAllRead,
    };
  }, [readIds, markRead, markAllRead]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}
