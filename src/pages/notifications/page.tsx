import { useState } from "react";
import { useTranslation } from "react-i18next";
import StatusBar from "@/components/layout/StatusBar";
import {
  useNotifications,
  type AppNotification,
  type NotifType,
} from "@/store/notifications-context";
import { formatNotificationTime } from "./format";
import {
  ChevronLeft,
  BadgeCheck,
  Award,
  Route as RouteIcon,
  MapPin,
  MessageSquareText,
  Megaphone,
  Bell,
  RefreshCw,
} from "lucide-react";

const typeMeta: Record<NotifType, { icon: typeof Bell; bg: string }> = {
  stamp: { icon: BadgeCheck, bg: "#F1E3D4" },
  badge: { icon: Award, bg: "#EFE3D2" },
  route: { icon: RouteIcon, bg: "#E4EAE0" },
  spot: { icon: MapPin, bg: "#F1E0D8" },
  review: { icon: MessageSquareText, bg: "#E6E8DC" },
  system: { icon: Megaphone, bg: "#EDE6DC" },
};

function notificationLink(notification: AppNotification): string | undefined {
  switch (notification.targetType) {
    case "stamp":
    case "badge":
      return "/stamp";
    case "route":
      return "/route";
    case "spot":
    case "review":
      return notification.targetId
        ? `/spot/${notification.targetId}`
        : undefined;
    default:
      return undefined;
  }
}

export default function NotificationsPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "en" ? "en" : "ko";
  const {
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
  } = useNotifications();
  const [markingAll, setMarkingAll] = useState(false);

  const navigate = (
    window as unknown as { REACT_APP_NAVIGATE?: (path: string) => void }
  ).REACT_APP_NAVIGATE;

  const open = (notification: AppNotification) => {
    void markRead(notification.id).catch(() => undefined);
    const link = notificationLink(notification);
    if (link) navigate?.(link);
  };

  const readAll = async () => {
    if (markingAll) return;
    setMarkingAll(true);
    try {
      await markAllRead();
    } catch {
      // Provider exposes the request error in the page.
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="min-h-full bg-page">
      <StatusBar variant="dark" />

      <div className="px-5 pt-1 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate?.("/mypage")}
          aria-label={t("notifications.back")}
          className="flex items-center justify-center w-9 h-9 rounded-2xl bg-cream cursor-pointer whitespace-nowrap"
        >
          <ChevronLeft size={20} color="#2C1810" strokeWidth={2} />
        </button>
        <span className="text-[18px] font-semibold text-ink">
          {t("notifications.title")}
        </span>
        <button
          type="button"
          onClick={() => void readAll()}
          disabled={unreadCount === 0 || markingAll || loading}
          className="text-[12px] font-medium text-brand disabled:text-line cursor-pointer whitespace-nowrap"
        >
          {markingAll
            ? t("notifications.markingAll")
            : t("notifications.markAll")}
        </button>
      </div>

      {unreadCount > 0 && (
        <p className="px-5 mt-3 text-[12px] text-muted">
          {t("notifications.unreadCount", { count: unreadCount })}
        </p>
      )}

      {error && (
        <div className="mx-5 mt-3 flex items-center gap-3 rounded-[14px] bg-white px-4 py-3 shadow-soft">
          <p className="flex-1 text-[12px] leading-relaxed text-[#B4453A]">
            {error}
          </p>
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={loading}
            className="flex items-center gap-1 text-[12px] font-semibold text-brand disabled:opacity-50"
          >
            <RefreshCw size={13} strokeWidth={2} />
            {t("notifications.retry")}
          </button>
        </div>
      )}

      {loading && items.length === 0 ? (
        <div className="px-5 mt-16 flex flex-col items-center text-muted">
          <RefreshCw size={22} className="animate-spin" />
          <p className="mt-3 text-[12px]">{t("notifications.loading")}</p>
        </div>
      ) : items.length === 0 && !error ? (
        <div className="px-5 mt-16 flex flex-col items-center text-center">
          <span className="flex items-center justify-center w-14 h-14 rounded-full bg-cream">
            <Bell size={24} color="#A8623E" strokeWidth={1.8} />
          </span>
          <p className="mt-4 text-[14px] font-semibold text-ink">
            {t("notifications.emptyTitle")}
          </p>
          <p className="mt-1 text-[12px] text-muted">
            {t("notifications.emptyDescription")}
          </p>
        </div>
      ) : (
        <div className="px-5 mt-3 flex flex-col gap-2.5">
          {items.map((notification) => {
            const meta = typeMeta[notification.type];
            const Icon = meta.icon;
            return (
              <button
                key={notification.id}
                type="button"
                onClick={() => open(notification)}
                className={`w-full flex gap-3 rounded-[16px] p-4 text-left cursor-pointer transition-colors ${
                  notification.read ? "bg-white" : "bg-cream"
                } shadow-soft`}
              >
                <span
                  className="flex items-center justify-center w-10 h-10 rounded-full shrink-0"
                  style={{ background: meta.bg }}
                >
                  <Icon size={18} color="#A8623E" strokeWidth={2} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[14px] font-semibold text-ink">
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                    )}
                  </div>
                  <p className="mt-1 text-[12.5px] text-sub leading-relaxed">
                    {notification.body}
                  </p>
                  <p className="mt-1.5 text-[11px] text-muted">
                    {formatNotificationTime(notification.createdAt, locale, {
                      justNow: t("notifications.time.justNow"),
                      minutesAgo: (value) =>
                        t("notifications.time.minutesAgo", { count: value }),
                      hoursAgo: (value) =>
                        t("notifications.time.hoursAgo", { count: value }),
                      daysAgo: (value) =>
                        t("notifications.time.daysAgo", { count: value }),
                    })}
                  </p>
                </div>
              </button>
            );
          })}

          {hasNext && (
            <button
              type="button"
              onClick={() => void loadMore()}
              disabled={loadingMore}
              className="h-11 rounded-[14px] bg-white border border-line text-[13px] font-semibold text-brand disabled:text-muted"
            >
              {loadingMore
                ? t("notifications.loadingMore")
                : t("notifications.loadMore")}
            </button>
          )}
        </div>
      )}

      <div className="h-24" />
    </div>
  );
}
