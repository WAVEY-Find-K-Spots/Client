import StatusBar from "@/components/layout/StatusBar";
import { useNotifications } from "@/store/notifications-context";
import { useTranslation } from "react-i18next";
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
  labelKey: string;
  descKey: string;
}

const rows: SettingRow[] = [
  {
    key: "stampEnabled",
    icon: BadgeCheck,
    labelKey: "mypage.notificationSettings.stampBadge",
    descKey: "mypage.notificationSettings.stampBadgeDescription",
  },
  {
    key: "routeEnabled",
    icon: RouteIcon,
    labelKey: "mypage.notificationSettings.routeRecommendation",
    descKey: "mypage.notificationSettings.routeRecommendationDescription",
  },
  {
    key: "spotEnabled",
    icon: MapPin,
    labelKey: "mypage.notificationSettings.spotReview",
    descKey: "mypage.notificationSettings.spotReviewDescription",
  },
  {
    key: "noticeEnabled",
    icon: Megaphone,
    labelKey: "mypage.notificationSettings.noticeUpdate",
    descKey: "mypage.notificationSettings.noticeUpdateDescription",
  },
];

export default function NotiSettingsView({
  onBack,
  onToast,
}: NotiSettingsViewProps) {
  const { t } = useTranslation();
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
      onToast(t("mypage.settings.notificationChangeFailed"));
    }
  };

  return (
    <div className="min-h-full bg-page">
      <StatusBar variant="dark" />
      <SubHeader
        title={t("mypage.main.notificationSettings")}
        onBack={onBack}
      />

      <div className="px-5 mt-5">
        <div className="bg-white rounded-[16px] shadow-soft overflow-hidden">
          <div className="flex items-center gap-3 px-4 h-[56px]">
            <span className="flex-1 text-[14px] font-semibold text-ink">
              {t("mypage.settings.pushNotifications")}
            </span>
            <Toggle
              label={t("mypage.settings.pushNotifications")}
              on={master}
              disabled={unavailable || settingsUpdating}
              onChange={(enabled) => void update({ pushEnabled: enabled })}
            />
          </div>
        </div>
        <p className="mt-2 px-1 text-[11px] text-muted">
          {settingsLoading
            ? t("mypage.notificationSettings.loading")
            : master
              ? t("mypage.notificationSettings.selectPreferences")
              : t("mypage.notificationSettings.enablePushHint")}
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
            const label = t(row.labelKey);
            return (
              <div key={row.key} className="flex items-center gap-3 px-4 h-[60px]">
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-cream shrink-0">
                  <Icon size={18} color="#A8623E" strokeWidth={1.9} />
                </span>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-ink">
                    {label}
                  </p>
                  <p className="text-[11px] text-muted mt-0.5">
                    {t(row.descKey)}
                  </p>
                </div>
                <Toggle
                  label={label}
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
