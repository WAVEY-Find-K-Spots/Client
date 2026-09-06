import StatusBar from "@/components/layout/StatusBar";
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
  Globe,
  Bell,
  Shield,
  FileText,
  Info,
  ChevronRight,
  LogOut,
} from "lucide-react";

interface MainViewProps {
  onOpenRoutes: () => void;
  onOpenEdit: () => void;
  onToast: (msg: string) => void;
}

const activityMenus = [
  { label: "저장한 스팟", icon: Heart, goto: "spot" },
  { label: "내 루트 목록", icon: Map, goto: "routes" },
  { label: "스탬프북", icon: Bookmark, goto: "stamp" },
  { label: "작성한 리뷰", icon: Star, goto: "review" },
];

const settingMenus = [
  { label: "언어 설정", icon: Globe, hint: "한국어" },
  { label: "알림 설정", icon: Bell, hint: "" },
  { label: "개인정보 처리방침", icon: Shield, hint: "" },
  { label: "이용약관", icon: FileText, hint: "" },
  { label: "앱 버전", icon: Info, hint: "v1.0.0" },
];

const statItems = [
  { icon: MapPin, value: "12", label: "방문 스팟" },
  { icon: Route, value: "4", label: "완성 루트" },
  { icon: Bookmark, value: "28", label: "저장 스팟" },
  { icon: Award, value: "3", label: "획득 뱃지" },
];

export default function MainView({
  onOpenRoutes,
  onOpenEdit,
  onToast,
}: MainViewProps) {
  const navigate = (
    window as unknown as { REACT_APP_NAVIGATE?: (p: string) => void }
  ).REACT_APP_NAVIGATE;

  const handleActivity = (goto: string) => {
    if (goto === "spot") navigate?.("/");
    else if (goto === "routes") onOpenRoutes();
    else if (goto === "stamp") navigate?.("/stamp");
    else onToast("작성한 리뷰 화면이 곧 열려요");
  };

  const handleLogout = () => onToast("로그아웃은 곧 지원할게요");

  return (
    <div className="min-h-full bg-page">
      <StatusBar variant="dark" />

      {/* 헤더 */}
      <div className="px-5 pt-1 flex items-center justify-between">
        <h1 className="text-[22px] font-extrabold tracking-tight text-ink">
          마이페이지
        </h1>
        <button
          type="button"
          onClick={() => onToast("설정 화면이 곧 열려요")}
          aria-label="설정"
          className="flex items-center justify-center w-9 h-9 rounded-2xl bg-cream cursor-pointer whitespace-nowrap"
        >
          <span className="flex items-center justify-center w-4 h-4">
            <Settings size={18} color="#A8623E" strokeWidth={1.9} />
          </span>
        </button>
      </div>

      {/* 프로필 카드 */}
      <div className="px-5 mt-4">
        <div className="rounded-[20px] bg-ink p-5 shadow-soft">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onOpenEdit}
              className="relative shrink-0 cursor-pointer"
              aria-label="프로필 이미지"
            >
              <span
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg,#A8623E,#6B3F28)",
                }}
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
              <h2 className="text-[18px] font-semibold text-white">
                여행자_시영
              </h2>
              <p className="text-[12px] text-muted mt-0.5">
                siyoung@wavey.kr
              </p>
              <button
                type="button"
                onClick={onOpenEdit}
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
                <span className="text-[10px] text-muted mt-1">
                  {s.label}
                </span>
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
                <span className="flex items-center justify-center w-4 h-4">
                  <ChevronRight size={16} color="#DDD4CE" strokeWidth={2} />
                </span>
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
                onClick={() => onToast(`${m.label} 화면이 곧 열려요`)}
                className="w-full flex items-center gap-3 px-4 h-[52px] cursor-pointer text-left"
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-cream shrink-0">
                  <Icon size={18} color="#A8623E" strokeWidth={1.9} />
                </span>
                <span className="flex-1 text-[14px] font-semibold text-ink">
                  {m.label}
                </span>
                {m.hint && (
                  <span className="text-[12px] text-muted">{m.hint}</span>
                )}
                <span className="flex items-center justify-center w-4 h-4">
                  <ChevronRight size={16} color="#DDD4CE" strokeWidth={2} />
                </span>
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
          className="w-full h-[52px] rounded-[14px] bg-white border border-line flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <span className="flex items-center justify-center w-4 h-4">
            <LogOut size={16} color="#A89890" strokeWidth={1.9} />
          </span>
          <span className="text-[14px] font-medium text-muted">로그아웃</span>
        </button>
      </div>

      <div className="h-24" />
    </div>
  );
}