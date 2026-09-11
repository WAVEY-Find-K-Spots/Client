import { useState } from "react";
import StatusBar from "@/components/layout/StatusBar";
import { useProfile } from "@/store/profile-context";
import { useNotifications } from "@/store/notifications-context";
import { useStamps } from "@/store/stamps-context";
import { useRoute } from "@/store/route-context";
import { useAuth } from "@/store/auth-context";
import { stamps, earnedBadges } from "@/mocks/stamps";
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

const activityMenus: { label: string; icon: typeof Heart; goto: string }[] = [
  { label: "저장한 스팟", icon: Heart, goto: "spot" },
  { label: "내 루트 목록", icon: Map, goto: "routes" },
  { label: "스탬프북", icon: Bookmark, goto: "stamp" },
  { label: "작성한 리뷰", icon: Star, goto: "reviews" },
];

const settingMenus: { label: string; icon: typeof Settings; view: MyPageView }[] = [
  { label: "설정", icon: Settings, view: "settings" },
  { label: "알림 설정", icon: Bell, view: "notiSettings" },
  { label: "개인정보 처리방침", icon: Shield, view: "policy" },
  { label: "이용약관", icon: FileText, view: "terms" },
];

export default function MainView({ onOpen, onToast }: MainViewProps) {
  const { profile } = useProfile();
  const { unreadCount } = useNotifications();
  const { isEarned } = useStamps();
  const { routeIds } = useRoute();
  const { logout } = useAuth();
  const [logoutPending, setLogoutPending] = useState(false);

  const navigate = (
    window as unknown as { REACT_APP_NAVIGATE?: (p: string) => void }
  ).REACT_APP_NAVIGATE;

  const earnedCount = stamps.filter((s) => isEarned(s.id)).length;
  const badgeCount = earnedBadges.length;

  const statItems = [
    { icon: MapPin, value: String(earnedCount), label: "방문 스팟" },
    { icon: Route, value: String(routeIds.length), label: "루트 스팟" },
    { icon: Bookmark, value: "28", label: "저장 스팟" },
    { icon: Award, value: String(badgeCount), label: "획득 뱃지" },
  ];

  const handleActivity = (goto: string) => {
    if (goto === "spot") navigate?.("/");
    else if (goto === "stamp") navigate?.("/stamp");
    else onOpen(goto as MyPageView);
  };

  const handleLogout = async () => {
    if (logoutPending) return;
    setLogoutPending(true);
    try {
      await logout();
    } catch {
      onToast("서버 로그아웃 요청에 실패해 로컬 로그인 정보만 삭제했습니다.");
    } finally {
      navigate?.("/login");
      setLogoutPending(false);
    }
  };

  return (
    <div className="min-h-full bg-page">
      <StatusBar variant="dark" />

      {/* 헤더 */}
      <div className="px-5 pt-1 flex items-center justify-between">
        <h1 className="text-[22px] font-extrabold tracking-tight text-ink">
          마이페이지
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate?.("/notifications")}
            aria-label="알림"
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
            aria-label="설정"
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
              aria-label="프로필 이미지"
            >
              <span
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#A8623E,#6B3F28)" }}
              >
                <span className="flex items-center justify-center w-7 h-7">
                  <User size={28} color="#FFFFFF" strokeWidth={1.8} />
                </span>
              </span>
              <span className="absolute -bottom-0.5 -right-0.5 w-[22px] h-[22px] rounded-full bg-brand flex items-center justify-center border-2 border-ink">
                <span className="flex items-center justify-center w-3 h-3">
                  <Camera size={12} color="#FFFFFF" strokeWidth={2} />
                </span>
              </span>
            </button>
            <div className="flex-1 min-w-0">
              <h2 className="text-[18px] font-semibold text-white truncate">
                {profile.nickname}
              </h2>
              <p className="text-[12px] text-muted mt-0.5 truncate">
                {profile.email}
              </p>
              <button
                type="button"
                onClick={() => onOpen("edit")}
                className="mt-1.5 text-[12px] font-medium text-brand cursor-pointer whitespace-nowrap"
              >
                프로필 편집
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
        <h3 className="text-[15px] font-semibold text-ink">내 활동</h3>
        <div className="mt-3 bg-white rounded-[16px] shadow-soft overflow-hidden divide-y divide-[#F5F1EE]">
          {activityMenus.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.label}
                type="button"
                onClick={() => handleActivity(m.goto)}
                className="w-full flex items-center gap-3 px-4 h-[52px] cursor-pointer text-left"
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-cream shrink-0">
                  <Icon size={18} color="#A8623E" strokeWidth={1.9} />
                </span>
                <span className="flex-1 text-[14px] font-semibold text-ink">
                  {m.label}
                </span>
                <ChevronRight size={16} color="#DDD4CE" strokeWidth={2} />
              </button>
            );
          })}
        </div>
      </div>

      {/* 설정 */}
      <div className="px-5 mt-6">
        <h3 className="text-[15px] font-semibold text-ink">설정</h3>
        <div className="mt-3 bg-white rounded-[16px] shadow-soft overflow-hidden divide-y divide-[#F5F1EE]">
          {settingMenus.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.label}
                type="button"
                onClick={() => onOpen(m.view)}
                className="w-full flex items-center gap-3 px-4 h-[52px] cursor-pointer text-left"
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-cream shrink-0">
                  <Icon size={18} color="#A8623E" strokeWidth={1.9} />
                </span>
                <span className="flex-1 text-[14px] font-semibold text-ink">
                  {m.label}
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
            {logoutPending ? "로그아웃 중..." : "로그아웃"}
          </span>
        </button>
      </div>

      <div className="h-24" />
    </div>
  );
}
