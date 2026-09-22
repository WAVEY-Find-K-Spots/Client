import { useState } from "react";
import { useTranslation } from "react-i18next";
import StatusBar from "@/components/layout/StatusBar";
import { ApiError } from "@/lib/auth/api";
import { requestLocationAccess } from "@/lib/geo";
import type { UserProfileUpdateRequest } from "@/lib/auth/types";
import { useAuth } from "@/store/auth-context";
import { useNotifications } from "@/store/notifications-context";
import SubHeader from "./SubHeader";
import Toggle from "./Toggle";
import { Bell, MapPin, Megaphone, Shield, FileText, Info, ChevronRight } from "lucide-react";

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

type ProfileSettingKey = "locationEnabled" | "marketingEnabled";

export default function SettingsView({ onBack, onOpen, onToast }: SettingsViewProps) {
  const { t } = useTranslation();
  const { user, updateProfile } = useAuth();
  const [profileSettingUpdating, setProfileSettingUpdating] = useState<
    ProfileSettingKey | null
  >(null);
  const {
    notificationSettings,
    settingsLoading,
    settingsUpdating,
    updateNotificationSettings,
  } = useNotifications();

  const updateProfileSetting = async (
    key: ProfileSettingKey,
    enabled: boolean,
  ) => {
    if (!user || profileSettingUpdating) return;
    setProfileSettingUpdating(key);
    try {
      if (key === "locationEnabled" && enabled) {
        await requestLocationAccess();
      }
      const patch: UserProfileUpdateRequest = key === "locationEnabled"
        ? { locationEnabled: enabled }
        : { marketingEnabled: enabled };
      await updateProfile(patch);
    } catch (error) {
      if (key === "locationEnabled" && enabled && !(error instanceof ApiError)) {
        onToast(t("mypage.settings.locationPermissionRequired"));
      } else {
        onToast(
          error instanceof ApiError
            ? error.message
            : t("mypage.settings.changeFailed"),
        );
      }
    } finally {
      setProfileSettingUpdating(null);
    }
  };

  const updatePushSetting = async (enabled: boolean) => {
    try {
      await updateNotificationSettings({ pushEnabled: enabled });
    } catch {
      onToast(t("mypage.settings.notificationChangeFailed"));
    }
  };

  return (
    <div className="min-h-full bg-page">
      <StatusBar variant="dark" />
      <SubHeader title={t("mypage.settings.title")} onBack={onBack} />

      {/* 알림 */}
      <div className="px-5 mt-5">
        <h3 className="text-[13px] font-semibold text-muted">
          {t("mypage.settings.notifications")}
        </h3>
        <div className="mt-2 bg-white rounded-[16px] shadow-soft overflow-hidden divide-y divide-[#F5F1EE]">
          <div className="flex items-center gap-3 px-4 h-[52px]">
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-cream shrink-0">
              <Bell size={18} color="#A8623E" strokeWidth={1.9} />
            </span>
            <span className="flex-1 text-[14px] font-semibold text-ink">
              {t("mypage.settings.pushNotifications")}
            </span>
            <Toggle
              label={t("mypage.settings.pushNotifications")}
              on={notificationSettings?.pushEnabled ?? false}
              disabled={
                settingsLoading || settingsUpdating || !notificationSettings
              }
              onChange={(enabled) => void updatePushSetting(enabled)}
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
            <span className="flex-1 text-[14px] font-semibold text-ink">
              {t("mypage.settings.notificationDetails")}
            </span>
            <ChevronRight size={16} color="#DDD4CE" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* 개인정보 */}
      <div className="px-5 mt-6">
        <h3 className="text-[13px] font-semibold text-muted">
          {t("mypage.settings.privacy")}
        </h3>
        <div className="mt-2 bg-white rounded-[16px] shadow-soft overflow-hidden divide-y divide-[#F5F1EE]">
          <div className="flex items-center gap-3 px-4 h-[52px]">
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-cream shrink-0">
              <MapPin size={18} color="#A8623E" strokeWidth={1.9} />
            </span>
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-ink">
                {t("mypage.settings.locationServices")}
              </p>
              <p className="text-[11px] text-muted mt-0.5">
                {t("mypage.settings.locationDescription")}
              </p>
            </div>
            <Toggle
              label={t("mypage.settings.locationServices")}
              on={user?.locationEnabled ?? false}
              disabled={!user || profileSettingUpdating !== null}
              onChange={(enabled) =>
                void updateProfileSetting("locationEnabled", enabled)
              }
            />
          </div>
          <div className="flex items-center gap-3 px-4 h-[52px]">
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-cream shrink-0">
              <Bell size={18} color="#A8623E" strokeWidth={1.9} />
            </span>
            <span className="flex-1 text-[14px] font-semibold text-ink">
              {t("mypage.settings.marketing")}
            </span>
            <Toggle
              label={t("mypage.settings.marketing")}
              on={user?.marketingEnabled ?? false}
              disabled={!user || profileSettingUpdating !== null}
              onChange={(enabled) =>
                void updateProfileSetting("marketingEnabled", enabled)
              }
            />
          </div>
        </div>
      </div>

      {/* 일반 */}
      <div className="px-5 mt-6">
        <h3 className="text-[13px] font-semibold text-muted">
          {t("mypage.settings.general")}
        </h3>
        <div className="mt-2 bg-white rounded-[16px] shadow-soft overflow-hidden divide-y divide-[#F5F1EE]">
          <button
            type="button"
            onClick={() => onOpen("policy")}
            className="w-full flex items-center gap-3 px-4 h-[52px] cursor-pointer text-left"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-cream shrink-0">
              <Shield size={18} color="#A8623E" strokeWidth={1.9} />
            </span>
            <span className="flex-1 text-[14px] font-semibold text-ink">
              {t("mypage.settings.privacyPolicy")}
            </span>
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
            <span className="flex-1 text-[14px] font-semibold text-ink">
              {t("mypage.settings.terms")}
            </span>
            <ChevronRight size={16} color="#DDD4CE" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => onToast(t("mypage.settings.latestVersion"))}
            className="w-full flex items-center gap-3 px-4 h-[52px] cursor-pointer text-left"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-cream shrink-0">
              <Info size={18} color="#A8623E" strokeWidth={1.9} />
            </span>
            <span className="flex-1 text-[14px] font-semibold text-ink">
              {t("mypage.settings.appVersion")}
            </span>
            <span className="text-[12px] text-muted">v1.0.0</span>
          </button>
        </div>
      </div>

      <div className="page-end-space" />
    </div>
  );
}
