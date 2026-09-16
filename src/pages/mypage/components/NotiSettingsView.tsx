import StatusBar from "@/components/layout/StatusBar";
import { useNotifications } from "@/store/notifications-context";
import SubHeader from "./SubHeader";
import Toggle from "./Toggle";
import {
  BadgeCheck,
  Route as RouteIcon,
  MapPin,
  Megaphone,
} from "lucide-react";
import type {
  NotificationSettings,
  NotificationSettingsPatch,
} from "@/lib/notifications-api";

interface NotiSettingsViewProps {
  onBack: () => void;
  onToast: (message: string) => void;
}

type DetailSettingKey = Exclude<keyof NotificationSettings, "pushEnabled">;

interface SettingRow {
  key: DetailSettingKey;
  icon: typeof BadgeCheck;
  label: string;
  desc: string;
}

const rows: SettingRow[] = [
  {
    key: "stampEnabled",
    icon: BadgeCheck,
    label: "스탬프·뱃지 알림",
    desc: "스탬프 획득과 뱃지 진행 상황",
  },
  {
    key: "routeEnabled",
    icon: RouteIcon,
    label: "루트 추천 알림",
    desc: "취향에 맞는 새 루트가 있을 때",
  },
  {
    key: "spotEnabled",
    icon: MapPin,
    label: "장소·리뷰 알림",
    desc: "저장한 장소의 변경과 새 리뷰",
  },
  {
    key: "noticeEnabled",
    icon: Megaphone,
    label: "공지·업데이트",
    desc: "새 기능과 서비스 소식",
  },
];

export default function NotiSettingsView({
  onBack,
  onToast,
}: NotiSettingsViewProps) {
  const {
    notificationSettings,
    settingsLoading,
    settingsUpdating,
    settingsError,
    updateNotificationSettings,
  } = useNotifications();
  const master = notificationSettings?.pushEnabled ?? false;
  const unavailable = settingsLoading || !notificationSettings;

  const update = async (patch: NotificationSettingsPatch) => {
    try {
      await updateNotificationSettings(patch);
    } catch {
      onToast("알림 설정을 변경하지 못했어요.");
    }
  };

  return (
    <div className="min-h-full bg-page">
      <StatusBar variant="dark" />
      <SubHeader title="알림 설정" onBack={onBack} />

      <div className="px-5 mt-5">
        <div className="bg-white rounded-[16px] shadow-soft overflow-hidden">
          <div className="flex items-center gap-3 px-4 h-[56px]">
            <span className="flex-1 text-[14px] font-semibold text-ink">
              앱 푸시 알림
            </span>
            <Toggle
              label="앱 푸시 알림"
              on={master}
              disabled={unavailable || settingsUpdating}
              onChange={(enabled) => void update({ pushEnabled: enabled })}
            />
          </div>
        </div>
        <p className="mt-2 px-1 text-[11px] text-muted">
          {settingsLoading
            ? "알림 설정을 불러오는 중이에요."
            : master
              ? "받고 싶은 알림을 선택하세요."
              : "푸시 알림을 켜면 세부 알림을 설정할 수 있어요."}
        </p>
        {settingsError && (
          <p className="mt-1 px-1 text-[11px] text-[#B4453A]">
            {settingsError}
          </p>
        )}
      </div>

      <div className="px-5 mt-4">
        <div className="bg-white rounded-[16px] shadow-soft overflow-hidden divide-y divide-[#F5F1EE]">
          {rows.map((row) => {
            const Icon = row.icon;
            const enabled = notificationSettings?.[row.key] ?? false;
            return (
              <div key={row.key} className="flex items-center gap-3 px-4 h-[60px]">
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-cream shrink-0">
                  <Icon size={18} color="#A8623E" strokeWidth={1.9} />
                </span>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-ink">
                    {row.label}
                  </p>
                  <p className="text-[11px] text-muted mt-0.5">{row.desc}</p>
                </div>
                <Toggle
                  label={row.label}
                  disabled={unavailable || settingsUpdating || !master}
                  on={master && enabled}
                  onChange={(next) => void update({ [row.key]: next })}
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
