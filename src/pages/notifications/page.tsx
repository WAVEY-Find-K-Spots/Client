import StatusBar from "@/components/layout/StatusBar";
import { useNotifications } from "@/store/notifications-context";
import type { NotifType } from "@/store/notifications-context";
import {
  ChevronLeft,
  BadgeCheck,
  Route as RouteIcon,
  MapPin,
  Megaphone,
  Bell,
} from "lucide-react";

const typeMeta: Record<NotifType, { icon: typeof Bell; bg: string }> = {
  stamp: { icon: BadgeCheck, bg: "#F1E3D4" },
  route: { icon: RouteIcon, bg: "#E4EAE0" },
  spot: { icon: MapPin, bg: "#F1E0D8" },
  system: { icon: Megaphone, bg: "#EDE6DC" },
};

export default function NotificationsPage() {
  const { items, unreadCount, markRead, markAllRead } = useNotifications();

  const navigate = (
    window as unknown as { REACT_APP_NAVIGATE?: (p: string) => void }
  ).REACT_APP_NAVIGATE;

  const open = (id: string, link?: string) => {
    markRead(id);
    if (link) navigate?.(link);
  };

  return (
    <div className="min-h-full bg-page">
      <StatusBar variant="dark" />

      <div className="px-5 pt-1 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate?.("/mypage")}
          aria-label="뒤로가기"
          className="flex items-center justify-center w-9 h-9 rounded-2xl bg-cream cursor-pointer whitespace-nowrap"
        >
          <span className="flex items-center justify-center w-4 h-4">
            <ChevronLeft size={20} color="#2C1810" strokeWidth={2} />
          </span>
        </button>
        <span className="text-[18px] font-semibold text-ink">알림</span>
        <button
          type="button"
          onClick={markAllRead}
          disabled={unreadCount === 0}
          className="text-[12px] font-medium text-brand disabled:text-line cursor-pointer whitespace-nowrap"
        >
          모두 읽음
        </button>
      </div>

      {unreadCount > 0 && (
        <p className="px-5 mt-3 text-[12px] text-muted">
          읽지 않은 알림 {unreadCount}개
        </p>
      )}

      <div className="px-5 mt-3 flex flex-col gap-2.5">
        {items.map((n) => {
          const meta = typeMeta[n.type];
          const Icon = meta.icon;
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => open(n.id, n.link)}
              className={`w-full flex gap-3 rounded-[16px] p-4 text-left cursor-pointer transition-colors ${
                n.read ? "bg-white" : "bg-cream"
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
                  <p className="text-[14px] font-semibold text-ink">{n.title}</p>
                  {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-brand" />}
                </div>
                <p className="mt-1 text-[12.5px] text-sub leading-relaxed">{n.body}</p>
                <p className="mt-1.5 text-[11px] text-muted">{n.at}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="h-24" />
    </div>
  );
}
