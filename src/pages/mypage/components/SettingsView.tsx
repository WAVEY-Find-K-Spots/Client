import StatusBar from "@/components/layout/StatusBar";
import { useSettings } from "@/store/settings-context";
import SubHeader from "./SubHeader";
import Toggle from "./Toggle";
import { Bell, MapPin, Megaphone, Globe, Shield, FileText, Info, ChevronRight } from "lucide-react";

type MyPageView =
  | "settings"
  | "notiSettings"
  | "policy"
  | "terms";

interface SettingsViewProps {
  onBack: () => void;
  onOpen: (view: MyPageView) => void;
  onToast: (msg: string) => void;
}

const LANGS = ["한국어", "English"];

export default function SettingsView({ onBack, onOpen, onToast }: SettingsViewProps) {
  const { settings, setSetting } = useSettings();

  const cycleLang = () => {
    const idx = LANGS.indexOf(settings.language);
    setSetting("language", LANGS[(idx + 1) % LANGS.length]);
  };

  return (
    <div className="min-h-full bg-page">
      <StatusBar variant="dark" />
      <SubHeader title="설정" onBack={onBack} />

      {/* 알림 */}
      <div className="px-5 mt-5">
        <h3 className="text-[13px] font-semibold text-muted">알림</h3>
        <div className="mt-2 bg-white rounded-[16px] shadow-soft overflow-hidden divide-y divide-[#F5F1EE]">
          <div className="flex items-center gap-3 px-4 h-[52px]">
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-cream shrink-0">
              <Bell size={18} color="#A8623E" strokeWidth={1.9} />
            </span>
            <span className="flex-1 text-[14px] font-semibold text-ink">앱 푸시 알림</span>
            <Toggle
              label="앱 푸시 알림"
              on={settings.pushEnabled}
              onChange={(v) => setSetting("pushEnabled", v)}
            />
          </div>
          <button
            type="button"
            onClick={() => onOpen("notiSettings")}
            className="w-full flex items-center gap-3 px-4 h-[52px] cursor-pointer text-left"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-cream shrink-0">
              <Megaphone size={18} color="#A8623E" strokeWidth={1.9} />
            </span>
            <span className="flex-1 text-[14px] font-semibold text-ink">알림 세부 설정</span>
            <ChevronRight size={16} color="#DDD4CE" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* 개인정보 */}
      <div className="px-5 mt-6">
        <h3 className="text-[13px] font-semibold text-muted">개인정보</h3>
        <div className="mt-2 bg-white rounded-[16px] shadow-soft overflow-hidden divide-y divide-[#F5F1EE]">
          <div className="flex items-center gap-3 px-4 h-[52px]">
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-cream shrink-0">
              <MapPin size={18} color="#A8623E" strokeWidth={1.9} />
            </span>
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-ink">위치 서비스</p>
              <p className="text-[11px] text-muted mt-0.5">스팟 근처에서 자동 스탬프 인식</p>
            </div>
            <Toggle
              label="위치 서비스"
              on={settings.locationEnabled}
              onChange={(v) => setSetting("locationEnabled", v)}
            />
          </div>
          <div className="flex items-center gap-3 px-4 h-[52px]">
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-cream shrink-0">
              <Bell size={18} color="#A8623E" strokeWidth={1.9} />
            </span>
            <span className="flex-1 text-[14px] font-semibold text-ink">마케팅 정보 수신</span>
            <Toggle
              label="마케팅 정보 수신"
              on={settings.marketingEnabled}
              onChange={(v) => setSetting("marketingEnabled", v)}
            />
          </div>
        </div>
      </div>

      {/* 일반 */}
      <div className="px-5 mt-6">
        <h3 className="text-[13px] font-semibold text-muted">일반</h3>
        <div className="mt-2 bg-white rounded-[16px] shadow-soft overflow-hidden divide-y divide-[#F5F1EE]">
          <button
            type="button"
            onClick={cycleLang}
            className="w-full flex items-center gap-3 px-4 h-[52px] cursor-pointer text-left"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-cream shrink-0">
              <Globe size={18} color="#A8623E" strokeWidth={1.9} />
            </span>
            <span className="flex-1 text-[14px] font-semibold text-ink">언어</span>
            <span className="text-[12px] text-muted">{settings.language}</span>
            <ChevronRight size={16} color="#DDD4CE" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => onOpen("policy")}
            className="w-full flex items-center gap-3 px-4 h-[52px] cursor-pointer text-left"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-cream shrink-0">
              <Shield size={18} color="#A8623E" strokeWidth={1.9} />
            </span>
            <span className="flex-1 text-[14px] font-semibold text-ink">개인정보 처리방침</span>
            <ChevronRight size={16} color="#DDD4CE" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => onOpen("terms")}
            className="w-full flex items-center gap-3 px-4 h-[52px] cursor-pointer text-left"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-cream shrink-0">
              <FileText size={18} color="#A8623E" strokeWidth={1.9} />
            </span>
            <span className="flex-1 text-[14px] font-semibold text-ink">이용약관</span>
            <ChevronRight size={16} color="#DDD4CE" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => onToast("최신 버전을 사용 중이에요")}
            className="w-full flex items-center gap-3 px-4 h-[52px] cursor-pointer text-left"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-cream shrink-0">
              <Info size={18} color="#A8623E" strokeWidth={1.9} />
            </span>
            <span className="flex-1 text-[14px] font-semibold text-ink">앱 버전</span>
            <span className="text-[12px] text-muted">v1.0.0</span>
          </button>
        </div>
      </div>

      <div className="h-24" />
    </div>
  );
}
