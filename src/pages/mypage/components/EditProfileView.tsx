import { useState } from "react";
import StatusBar from "@/components/layout/StatusBar";
import { useAuth } from "@/store/auth-context";
import { ApiError } from "@/lib/auth/api";
import type { CountryCode, UserLanguage } from "@/lib/auth/types";
import { countryCodes, countryLabels } from "@/lib/country-codes";
import SubHeader from "./SubHeader";
import { User, Camera } from "lucide-react";

interface EditProfileViewProps {
  onBack: () => void;
  onToast: (msg: string) => void;
}

const languageLabels: Record<UserLanguage, string> = {
  KO: "한국어",
  EN: "English",
};

export default function EditProfileView({ onBack, onToast }: EditProfileViewProps) {
  const { user, updateProfile } = useAuth();
  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [countryCode, setCountryCode] = useState<CountryCode | null>(
    user?.countryCode ?? null,
  );
  const [language, setLanguage] = useState<UserLanguage>(user?.language ?? "KO");
  const [saving, setSaving] = useState(false);
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);

  const dirty =
    nickname !== (user?.nickname ?? "") ||
    countryCode !== (user?.countryCode ?? null) ||
    language !== (user?.language ?? "KO");
  const valid = nickname.trim().length > 0;

  const save = async () => {
    if (!valid || saving) {
      if (!valid) onToast("닉네임을 입력해 주세요");
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        nickname: nickname.trim(),
        countryCode: countryCode ?? undefined,
        language,
      });
      onToast("프로필을 저장했어요");
      onBack();
    } catch (err) {
      onToast(err instanceof ApiError ? err.message : "프로필을 저장하지 못했어요.");
    } finally {
      setSaving(false);
    }
  };

  const fieldCls =
    "w-full text-[15px] font-semibold text-ink bg-transparent outline-none placeholder:text-line";

  return (
    <div className="min-h-full bg-page">
      <StatusBar variant="dark" />
      <SubHeader
        title="프로필 편집"
        onBack={onBack}
        right={
          <button
            type="button"
            onClick={save}
            disabled={!dirty || !valid || saving}
            className="text-[14px] font-semibold text-brand disabled:text-line cursor-pointer whitespace-nowrap"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        }
      />

      {/* 프로필 이미지 */}
      <div className="px-5 mt-8 flex flex-col items-center">
        <span
          className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden"
          style={{ background: "linear-gradient(135deg,#A8623E,#6B3F28)" }}
        >
          {user?.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={40} color="#FFFFFF" strokeWidth={1.6} />
          )}
        </span>
        <button
          type="button"
          onClick={() => onToast("사진 변경은 준비 중이에요")}
          className="mt-3 h-9 px-4 rounded-full bg-cream flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <Camera size={14} color="#A8623E" strokeWidth={2} />
          <span className="text-[12px] font-medium text-brand">사진 변경</span>
        </button>
      </div>

      {/* 입력 폼 */}
      <div className="px-5 mt-7">
        <div className="bg-white rounded-[16px] shadow-soft overflow-hidden divide-y divide-[#F5F1EE]">
          <label className="flex flex-col px-4 py-3">
            <span className="text-[12px] font-medium text-muted">닉네임</span>
            <input
              className={`mt-1 ${fieldCls}`}
              value={nickname}
              maxLength={50}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임"
            />
          </label>
          <div className="flex flex-col px-4 py-3">
            <span className="text-[12px] font-medium text-muted">이메일</span>
            <span className="mt-1 text-[15px] font-semibold text-muted">
              {user?.email}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setCountryPickerOpen((v) => !v)}
            className="w-full flex flex-col items-start px-4 py-3 text-left cursor-pointer"
          >
            <span className="text-[12px] font-medium text-muted">국적</span>
            <span className="mt-1 text-[15px] font-semibold text-ink">
              {countryCode ? countryLabels[countryCode] : "선택 안 함"}
            </span>
          </button>
          {countryPickerOpen && (
            <div className="px-4 py-3 flex flex-wrap gap-2">
              {countryCodes.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    setCountryCode(code);
                    setCountryPickerOpen(false);
                  }}
                  className={`px-3 h-8 rounded-full text-[12px] font-medium cursor-pointer whitespace-nowrap ${
                    countryCode === code
                      ? "bg-ink text-white"
                      : "bg-cream text-muted"
                  }`}
                >
                  {countryLabels[code]}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() =>
              setLanguage((l) => (l === "KO" ? "EN" : "KO"))
            }
            className="w-full flex flex-col items-start px-4 py-3 text-left cursor-pointer"
          >
            <span className="text-[12px] font-medium text-muted">선호 언어</span>
            <span className="mt-1 text-[15px] font-semibold text-ink">
              {languageLabels[language]}
            </span>
          </button>
        </div>
      </div>

      <div className="px-5 mt-7">
        <button
          type="button"
          onClick={save}
          disabled={!dirty || !valid || saving}
          className="w-full h-[52px] rounded-full bg-ink text-white text-[15px] font-semibold shadow-soft cursor-pointer disabled:opacity-40 whitespace-nowrap"
        >
          {saving ? "저장 중..." : "저장하기"}
        </button>
      </div>

      <div className="h-24" />
    </div>
  );
}
