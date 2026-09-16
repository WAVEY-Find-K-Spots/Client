import { useEffect, useRef, useState } from "react";
import StatusBar from "@/components/layout/StatusBar";
import SafeImage from "@/components/SafeImage";
import { useAuth } from "@/store/auth-context";
import { ApiError } from "@/lib/auth/api";
import type { CountryCode, UserLanguage, UserProfileUpdateRequest } from "@/lib/auth/types";
import { countryCodes, countryLabels } from "@/lib/country-codes";
import { createPresignedUrl, uploadFileToStorage } from "@/lib/upload-api";
import SubHeader from "./SubHeader";
import { User, Camera } from "lucide-react";

const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface EditProfileViewProps {
  onBack: () => void;
  onToast: (msg: string) => void;
}

const languageLabels: Record<UserLanguage, string> = {
  KO: "한국어",
  EN: "English",
};

export default function EditProfileView({ onBack, onToast }: EditProfileViewProps) {
  const { user, updateProfile, confirmProfilePhoto } = useAuth();
  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [countryCode, setCountryCode] = useState<CountryCode | null>(
    user?.countryCode ?? null,
  );
  const [language, setLanguage] = useState<UserLanguage>(user?.language ?? "KO");
  const [saving, setSaving] = useState(false);
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null);
  const [pendingPhotoPreviewUrl, setPendingPhotoPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoPick = () => fileInputRef.current?.click();

  useEffect(() => {
    return () => {
      if (pendingPhotoPreviewUrl) URL.revokeObjectURL(pendingPhotoPreviewUrl);
    };
  }, [pendingPhotoPreviewUrl]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      onToast("jpg/png/webp 이미지만 업로드할 수 있어요");
      return;
    }
    if (pendingPhotoPreviewUrl) URL.revokeObjectURL(pendingPhotoPreviewUrl);
    setPendingPhotoFile(file);
    setPendingPhotoPreviewUrl(URL.createObjectURL(file));
    onToast("저장하기를 누르면 프로필 사진이 반영돼요");
  };

  const nicknameDirty = nickname !== (user?.nickname ?? "");
  const countryCodeDirty = countryCode !== (user?.countryCode ?? null);
  const languageDirty = language !== (user?.language ?? "KO");
  const profileDirty = nicknameDirty || countryCodeDirty || languageDirty;
  const photoDirty = pendingPhotoFile !== null;
  const dirty = profileDirty || photoDirty;
  const valid = !nicknameDirty || nickname.trim().length > 0;

  const save = async () => {
    if (!valid || saving) {
      if (!valid) onToast("닉네임을 입력해 주세요");
      return;
    }
    setSaving(true);
    try {
      let nextProfilePhotoUrl: string | null = null;
      if (pendingPhotoFile) {
        const { uploadUrl, fileUrl } = await createPresignedUrl(
          "PROFILE",
          pendingPhotoFile.type,
        );
        await uploadFileToStorage(uploadUrl, pendingPhotoFile);
        nextProfilePhotoUrl = fileUrl;
      }

      if (profileDirty) {
        const patch: UserProfileUpdateRequest = {};
        if (nicknameDirty) patch.nickname = nickname.trim();
        if (countryCodeDirty) patch.countryCode = countryCode ?? undefined;
        if (languageDirty) patch.language = language;
        await updateProfile(patch);
      }

      if (nextProfilePhotoUrl) {
        await confirmProfilePhoto(nextProfilePhotoUrl);
      }

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
          <SafeImage
            src={pendingPhotoPreviewUrl ?? user?.profileImageUrl}
            alt=""
            className="w-full h-full object-cover"
            fallback={<User size={40} color="#FFFFFF" strokeWidth={1.6} />}
          />
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handlePhotoChange}
        />
        <button
          type="button"
          onClick={handlePhotoPick}
          disabled={saving}
          className="mt-3 h-9 px-4 rounded-full bg-cream flex items-center gap-1.5 cursor-pointer whitespace-nowrap disabled:opacity-60"
        >
          <Camera size={14} color="#A8623E" strokeWidth={2} />
          <span className="text-[12px] font-medium text-brand">
            사진 변경
          </span>
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
