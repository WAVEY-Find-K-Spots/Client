import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { ApiError } from "@/lib/auth/api";
import {
  notificationsApi,
  type NotificationItem,
  type NotificationSettings,
  type NotificationSettingsPatch,
} from "@/lib/notifications-api";
import { useAuth } from "./auth-context";
import { useSettings } from "./settings-context";
import {
  NotificationsContext,
  type NotificationsContextValue,
} from "./notifications-context";

const PAGE_SIZE = 20;

function errorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError || error instanceof Error
    ? error.message
    : fallback;
}

function mergeNotifications(
  current: NotificationItem[],
  incoming: NotificationItem[],
) {
  const merged = new Map(current.map((item) => [item.id, item]));
  incoming.forEach((item) => merged.set(item.id, item));
  return Array.from(merged.values());
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { settings } = useSettings();
  const language = settings.language === "English" ? "en" : "ko";
  const requestId = useRef(0);

  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsUpdating, setSettingsUpdating] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  const clear = useCallback(() => {
    requestId.current += 1;
    setItems([]);
    setUnreadCount(0);
    setPage(0);
    setHasNext(false);
    setLoading(false);
    setLoadingMore(false);
    setError(null);
    setNotificationSettings(null);
    setSettingsLoading(false);
    setSettingsUpdating(false);
    setSettingsError(null);
  }, []);

  const fetchInbox = useCallback(
    async (targetPage: number, replace: boolean) => {
      if (!user) return;

      const currentRequestId = ++requestId.current;
      if (replace) setLoading(true);
      else setLoadingMore(true);
      setError(null);

      try {
        const inbox = await notificationsApi.getInbox({
          language,
          page: targetPage,
          size: PAGE_SIZE,
        });
        if (currentRequestId !== requestId.current) return;

        setItems((current) =>
          replace
            ? inbox.notifications
            : mergeNotifications(current, inbox.notifications),
        );
        setUnreadCount(inbox.unreadCount);
        setPage(inbox.page);
        setHasNext(inbox.hasNext);
      } catch (requestError) {
        if (currentRequestId !== requestId.current) return;
        setError(
          errorMessage(requestError, "알림을 불러오지 못했습니다."),
        );
      } finally {
        if (currentRequestId === requestId.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [language, user],
  );

  const refresh = useCallback(
    () => fetchInbox(0, true),
    [fetchInbox],
  );

  const loadMore = useCallback(async () => {
    if (!user || loading || loadingMore || !hasNext) return;
    await fetchInbox(page + 1, false);
  }, [fetchInbox, hasNext, loading, loadingMore, page, user]);

  useEffect(() => {
    if (!user) {
      clear();
      return;
    }
    void fetchInbox(0, true);
  }, [clear, fetchInbox, user]);

  useEffect(() => {
    if (!user) return;

    let active = true;
    setSettingsLoading(true);
    setSettingsError(null);
    notificationsApi
      .getSettings()
      .then((response) => {
        if (active) setNotificationSettings(response);
      })
      .catch((requestError) => {
        if (active) {
          setSettingsError(
            errorMessage(requestError, "알림 설정을 불러오지 못했습니다."),
          );
        }
      })
      .finally(() => {
        if (active) setSettingsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const markRead = useCallback(
    async (id: number) => {
      const previous = items.find((item) => item.id === id);
      if (!previous || previous.read) return;

      setItems((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, read: true, readAt: new Date().toISOString() }
            : item,
        ),
      );
      setUnreadCount((count) => Math.max(0, count - 1));

      try {
        const updated = await notificationsApi.markRead(id, language);
        setItems((current) =>
          current.map((item) => (item.id === id ? updated : item)),
        );
      } catch (requestError) {
        setItems((current) =>
          current.map((item) => (item.id === id ? previous : item)),
        );
        setUnreadCount((count) => count + 1);
        setError(
          errorMessage(requestError, "알림 읽음 처리에 실패했습니다."),
        );
        throw requestError;
      }
    },
    [items, language],
  );

  const markAllRead = useCallback(async () => {
    const previousItems = items;
    const previousUnreadCount = unreadCount;
    if (previousUnreadCount === 0) return;

    const readAt = new Date().toISOString();
    setItems((current) =>
      current.map((item) => ({ ...item, read: true, readAt })),
    );
    setUnreadCount(0);

    try {
      await notificationsApi.markAllRead();
    } catch (requestError) {
      setItems(previousItems);
      setUnreadCount(previousUnreadCount);
      setError(
        errorMessage(requestError, "전체 읽음 처리에 실패했습니다."),
      );
      throw requestError;
    }
  }, [items, unreadCount]);

  const updateNotificationSettings = useCallback(
    async (patch: NotificationSettingsPatch) => {
      if (!notificationSettings || settingsUpdating) return;

      const previous = notificationSettings;
      setNotificationSettings({ ...previous, ...patch });
      setSettingsUpdating(true);
      setSettingsError(null);

      try {
        const updated = await notificationsApi.updateSettings(patch);
        setNotificationSettings(updated);
      } catch (requestError) {
        setNotificationSettings(previous);
        setSettingsError(
          errorMessage(requestError, "알림 설정 변경에 실패했습니다."),
        );
        throw requestError;
      } finally {
        setSettingsUpdating(false);
      }
    },
    [notificationSettings, settingsUpdating],
  );

  const value = useMemo<NotificationsContextValue>(
    () => ({
      items,
      unreadCount,
      loading,
      loadingMore,
      hasNext,
      error,
      refresh,
      loadMore,
      markRead,
      markAllRead,
      notificationSettings,
      settingsLoading,
      settingsUpdating,
      settingsError,
      updateNotificationSettings,
    }),
    [
      error,
      hasNext,
      items,
      loadMore,
      loading,
      loadingMore,
      markAllRead,
      markRead,
      notificationSettings,
      refresh,
      settingsError,
      settingsLoading,
      settingsUpdating,
      unreadCount,
      updateNotificationSettings,
    ],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}
