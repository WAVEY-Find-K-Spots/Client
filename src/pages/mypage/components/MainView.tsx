import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import StatusBar from "@/components/layout/StatusBar";
import SafeImage from "@/components/SafeImage";
import { useNotifications } from "@/store/notifications-context";
import { useRoute } from "@/store/route-context";
import { useAuth } from "@/store/auth-context";
import { getMyStamps, getMyBadges } from "@/lib/stamps-api";
import { searchSpots } from "@/lib/spots-api";
import type { MyPageView } from "../page";
import {
  Settings,
  User,
  Camera,
  MapPin,
  Route,
  Bookmark,
  Award,
  Heart,
  Map,
  Star,
  Bell,
  Shield,
  FileText,
  ChevronRight,
  LogOut,
} from "lucide-react";

interface MainViewProps {
  onOpen: (view: MyPageView) => void;
  onToast: (msg: string) => void;
}

const activityMenus: { labelKey: string; icon: typeof Heart; goto: string }[] = [
  { labelKey: "mypage.main.savedSpots", icon: Heart, goto: "savedSpots" },
  { labelKey: "mypage.main.myRoutes", icon: Map, goto: "routes" },
  { labelKey: "mypage.main.stampBook", icon: Bookmark, goto: "stamp" },
  { labelKey: "mypage.main.myReviews", icon: Star, goto: "reviews" },
];

const settingMenus: { labelKey: string; icon: typeof Settings; view: MyPageView }[] = [
  { labelKey: "mypage.main.settings", icon: Settings, view: "settings" },
  { labelKey: "mypage.main.notificationSettings", icon: Bell, view: "notiSettings" },
  { labelKey: "mypage.main.privacyPolicy", icon: Shield, view: "policy" },
  { labelKey: "mypage.main.terms", icon: FileText, view: "terms" },
];

export default function MainView({ onOpen, onToast }: MainViewProps) {
  const { t } = useTranslation();
  const { unreadCount } = useNotifications();
  const { routeIds } = useRoute();
  const { user, logout, withdraw } = useAuth();
  const [logoutPending, setLogoutPending] = useState(false);
  const [withdrawPending, setWithdrawPending] = useState(false);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const [visitedCount, setVisitedCount] = useState<number | null>(null);
  const [badgeCount, setBadgeCount] = useState<number | null>(null);
  const [savedCount, setSavedCount] = useState<number | null>(null);

  const navigate = (
    window as unknown as { REACT_APP_NAVIGATE?: (p: string) => void }
  ).REACT_APP_NAVIGATE;

  useEffect(() => {
    if (!user) {
      setVisitedCount(null);
      setBadgeCount(null);
      setSavedCount(null);
      return;
    }
    let cancelled = false;
    getMyStamps({ page: 0, size: 1 })
      .then((book) => {
        if (!cancelled) setVisitedCount(book.collectedCount);
      })
      .catch(() => {
        if (!cancelled) setVisitedCount(0);
      });
    getMyBadges("ko")
      .then((badges) => {
        if (!cancelled) setBadgeCount(badges.acquiredCount);
      })
      .catch(() => {
        if (!cancelled) setBadgeCount(0);
      });
    searchSpots({ savedOnly: true, page: 0 })
      .then((result) => {
        if (!cancelled) setSavedCount(result.totalElements);
      })
      .catch(() => {
        if (!cancelled) setSavedCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const statItems = [
    {
      icon: MapPin,
      value: visitedCount === null ? "-" : String(visitedCount),
      label: t("mypage.main.visitedSpots"),
    },
    {
      icon: Route,
      value: String(routeIds.length),
      label: t("mypage.main.routeSpots"),
    },
    {
      icon: Bookmark,
      value: savedCount === null ? "-" : String(savedCount),
      label: t("mypage.main.savedSpotCount"),
    },
    {
      icon: Award,
      value: badgeCount === null ? "-" : String(badgeCount),
      label: t("mypage.main.badges"),
    },
  ];

  const handleActivity = (goto: string) => {
    if (goto === "stamp") navigate?.("/stamp");
    else onOpen(goto as MyPageView);
  };

  const handleLogout = async () => {
    if (logoutPending) return;
    setLogoutPending(true);
    try {
      await logout();
    } catch {
      onToast(t("mypage.main.logoutFailed"));
    } finally {
      navigate?.("/login");
      setLogoutPending(false);
    }
  };

  const handleWithdraw = async () => {
    if (withdrawPending) return;
    setWithdrawPending(true);
    try {
      await withdraw();
      navigate?.("/login");
    } catch {
      onToast(t("mypage.main.withdrawFailed"));
    } finally {
      setWithdrawPending(false);
      setConfirmWithdraw(false);
    }
  };

  return (
    <div className="min-h-full bg-page">
      <StatusBar variant="dark" />

      {/* 헤더 */}
      <div className="px-5 pt-1 flex items-center justify-between">
        <h1 className="text-[22px] font-extrabold tracking-tight text-ink">
          {t("mypage.main.title")}
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate?.("/notifications")}
            aria-label={t("mypage.main.notifications")}
            className="relative flex items-center justify-center w-9 h-9 rounded-2xl bg-cream cursor-pointer whitespace-nowrap"
          >
            <Bell size={18} color="#A8623E" strokeWidth={1.9} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-brand text-white text-[9px] font-bold flex items-center justify-center border-2 border-page">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => onOpen("settings")}
            aria-label={t("mypage.main.settings")}
            className="flex items-center justify-center w-9 h-9 rounded-2xl bg-cream cursor-pointer whitespace-nowrap"
          >
            <Settings size={18} color="#A8623E" strokeWidth={1.9} />
          </button>
        </div>
      </div>

      {/* 프로필 카드 */}
      <div className="px-5 mt-4">
        <div className="rounded-[20px] bg-ink p-5 shadow-soft">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onOpen("edit")}
              className="relative shrink-0 cursor-pointer"
              aria-label={t("mypage.main.profileImage")}
            >
              <span
                className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden"
                style={{ background: "linear-gradient(135deg,#A8623E,#6B3F28)" }}
              >
                <SafeImage
                  src={user?.profileImageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                  fallback={
                    <span className="flex items-center justify-center w-7 h-7">
                      <User size={28} color="#FFFFFF" strokeWidth={1.8} />
                    </span>
                  }
                />
              </span>
              <span className="absolute -bottom-0.5 -right-0.5 w-[22px] h-[22px] rounded-full bg-brand flex items-center justify-center border-2 border-ink">
                <span className="flex items-center justify-center w-3 h-3">
                  <Camera size={12} color="#FFFFFF" strokeWidth={2} />
                </span>
              </span>
            </button>
            <div className="flex-1 min-w-0">
              <h2 className="text-[18px] font-semibold text-white truncate">
                {user?.nickname || user?.name || t("mypage.main.traveler")}
              </h2>
              <p className="text-[12px] text-muted mt-0.5 truncate">
                {user?.email}
              </p>
              <button
                type="button"
                onClick={() => onOpen("edit")}
                className="mt-1.5 text-[12px] font-medium text-brand cursor-pointer whitespace-nowrap"
              >
                {t("mypage.main.editProfile")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 여행 통계 */}
      <div className="px-5 mt-4">
        <div className="bg-white rounded-[16px] p-4 shadow-soft flex items-center">
          {statItems.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className={`flex-1 flex flex-col items-center py-1 ${
                  i > 0 ? "border-l border-line" : ""
                }`}
              >
                <span className="flex items-center justify-center w-6 h-6 mb-1">
                  <Icon size={20} color="#A8623E" strokeWidth={1.9} />
                </span>
                <span className="text-[20px] font-extrabold leading-none text-ink">
                  {s.value}
                </span>
                <span className="text-[10px] text-muted mt-1">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 내 활동 */}
      <div className="px-5 mt-6">
        <h3 className="text-[15px] font-semibold text-ink">
          {t("mypage.main.myActivity")}
        </h3>
        <div className="mt-3 bg-white rounded-[16px] shadow-soft overflow-hidden divide-y divide-[#F5F1EE]">
          {activityMenus.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.labelKey}
                type="button"
                onClick={() => handleActivity(m.goto)}
                className="w-full flex items-center gap-3 px-4 h-[52px] cursor-pointer text-left"
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-cream shrink-0">
                  <Icon size={18} color="#A8623E" strokeWidth={1.9} />
                </span>
                <span className="flex-1 text-[14px] font-semibold text-ink">
                  {t(m.labelKey)}
                </span>
                <ChevronRight size={16} color="#DDD4CE" strokeWidth={2} />
              </button>
            );
          })}
        </div>
      </div>

      {/* 설정 */}
      <div className="px-5 mt-6">
        <h3 className="text-[15px] font-semibold text-ink">
          {t("mypage.main.settings")}
        </h3>
        <div className="mt-3 bg-white rounded-[16px] shadow-soft overflow-hidden divide-y divide-[#F5F1EE]">
          {settingMenus.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.labelKey}
                type="button"
                onClick={() => onOpen(m.view)}
                className="w-full flex items-center gap-3 px-4 h-[52px] cursor-pointer text-left"
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-cream shrink-0">
                  <Icon size={18} color="#A8623E" strokeWidth={1.9} />
                </span>
                <span className="flex-1 text-[14px] font-semibold text-ink">
                  {t(m.labelKey)}
                </span>
                <ChevronRight size={16} color="#DDD4CE" strokeWidth={2} />
              </button>
            );
          })}
        </div>
      </div>

      {/* 로그아웃 */}
      <div className="px-5 mt-6">
        <button
          type="button"
          onClick={handleLogout}
          disabled={logoutPending}
          className="w-full h-[52px] rounded-[14px] bg-white border border-line flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <span className="flex items-center justify-center w-4 h-4">
            <LogOut size={16} color="#A89890" strokeWidth={1.9} />
          </span>
          <span className="text-[14px] font-medium text-muted">
            {logoutPending
              ? t("mypage.main.loggingOut")
              : t("mypage.main.logout")}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setConfirmWithdraw(true)}
          className="w-full mt-3 h-9 flex items-center justify-center cursor-pointer whitespace-nowrap"
        >
          <span className="text-[12px] font-medium text-[#B4453A]">
            {t("mypage.main.withdraw")}
          </span>
        </button>
      </div>

      {confirmWithdraw && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center px-8"
          onClick={() => !withdrawPending && setConfirmWithdraw(false)}
        >
          <div
            className="w-full max-w-[320px] rounded-[16px] bg-white p-5 shadow-soft"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[15px] font-semibold text-ink">
              {t("mypage.main.withdrawConfirmTitle")}
            </p>
            <p className="text-[12px] text-muted mt-1.5 leading-relaxed">
              {t("mypage.main.withdrawConfirmDescription")}
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmWithdraw(false)}
                disabled={withdrawPending}
                className="flex-1 h-10 rounded-full bg-cream text-[13px] font-semibold text-ink cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                {t("mypage.main.cancel")}
              </button>
              <button
                type="button"
                onClick={handleWithdraw}
                disabled={withdrawPending}
                className="flex-1 h-10 rounded-full bg-[#B4453A] text-white text-[13px] font-semibold cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                {withdrawPending
                  ? t("mypage.main.withdrawing")
                  : t("mypage.main.withdrawAction")}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="h-24" />
    </div>
  );
}
