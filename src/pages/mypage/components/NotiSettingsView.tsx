import StatusBar from "@/components/layout/StatusBar";
import { useSettings } from "@/store/settings-context";
import SubHeader from "./SubHeader";
import Toggle from "./Toggle";
import { BadgeCheck, Route as RouteIcon, Megaphone } from "lucide-react";

interface NotiSettingsViewProps {
  onBack: () => void;
}

export default function NotiSettingsView({ onBack }: NotiSettingsViewProps) {
  const { settings, setSetting } = useSettings();
  const master = settings.pushEnabled;

  const rows = [
    {
      key: "notifStamp" as const,
      icon: BadgeCheck,
      label: "스탬프 획득 알림",
      desc: "방문 스탬프를 모을 때",
    },
    {
      key: "notifRoute" as const,
      icon: RouteIcon,
      label: "루트 추천 알림",
      desc: "취향에 맞는 새 루트가 있을 때",
    },
    {
      key: "notifSystem" as const,
      icon: Megaphone,
      label: "공지·업데이트",
      desc: "새 기능과 서비스 소식",
    },
  ];

  return (
    <div className="min-h-full bg-page">
      <StatusBar variant="dark" />
      <SubHeader title="알림 설정" onBack={onBack} />

      <div className="px-5 mt-5">
        <div className="bg-white rounded-[16px] shadow-soft overflow-hidden">
          <div className="flex items-center gap-3 px-4 h-[56px]">
            <span className="flex-1 text-[14px] font-semibold text-ink">앱 푸시 알림</span>
            <Toggle
              label="앱 푸시 알림"
              on={master}
              onChange={(v) => setSetting("pushEnabled", v)}
            />
          </div>
        </div>
        <p className="mt-2 px-1 text-[11px] text-muted">
          {master ? "받고 싶은 알림을 선택하세요." : "푸시 알림을 켜면 세부 알림을 설정할 수 있어요."}
        </p>
      </div>

      <div className="px-5 mt-4">
        <div className="bg-white rounded-[16px] shadow-soft overflow-hidden divide-y divide-[#F5F1EE]">
          {rows.map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.key} className="flex items-center gap-3 px-4 h-[60px]">
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-cream shrink-0">
                  <Icon size={18} color="#A8623E" strokeWidth={1.9} />
                </span>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-ink">{r.label}</p>
                  <p className="text-[11px] text-muted mt-0.5">{r.desc}</p>
                </div>
                <Toggle
                  label={r.label}
                  disabled={!master}
                  on={master && settings[r.key]}
                  onChange={(v) => setSetting(r.key, v)}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="h-24" />
    </div>
  );
}
