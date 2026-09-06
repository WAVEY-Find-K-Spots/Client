import { useState } from "react";
import StatusBar from "@/components/layout/StatusBar";
import { useProfile } from "@/store/profile-context";
import SubHeader from "./SubHeader";
import { User, Camera } from "lucide-react";

interface EditProfileViewProps {
  onBack: () => void;
  onToast: (msg: string) => void;
}

const LANGS = ["한국어", "English"];

export default function EditProfileView({ onBack, onToast }: EditProfileViewProps) {
  const { profile, updateProfile } = useProfile();
  const [draft, setDraft] = useState(profile);

  const set = (patch: Partial<typeof draft>) => setDraft((d) => ({ ...d, ...patch }));

  const dirty = JSON.stringify(draft) !== JSON.stringify(profile);
  const valid = draft.nickname.trim().length > 0 && /\S+@\S+\.\S+/.test(draft.email);

  const save = () => {
    if (!valid) {
      onToast("닉네임과 이메일을 확인해 주세요");
      return;
    }
    updateProfile({
      nickname: draft.nickname.trim(),
      email: draft.email.trim(),
      nationality: draft.nationality.trim(),
      language: draft.language,
    });
    onToast("프로필을 저장했어요");
    onBack();
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
            disabled={!dirty || !valid}
            className="text-[14px] font-semibold text-brand disabled:text-line cursor-pointer whitespace-nowrap"
          >
            저장
          </button>
        }
      />

      {/* 프로필 이미지 */}
      <div className="px-5 mt-8 flex flex-col items-center">
        <span
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#A8623E,#6B3F28)" }}
        >
          <User size={40} color="#FFFFFF" strokeWidth={1.6} />
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
              value={draft.nickname}
              maxLength={20}
              onChange={(e) => set({ nickname: e.target.value })}
              placeholder="닉네임"
            />
          </label>
          <label className="flex flex-col px-4 py-3">
            <span className="text-[12px] font-medium text-muted">이메일</span>
            <input
              type="email"
              inputMode="email"
              className={`mt-1 ${fieldCls}`}
              value={draft.email}
              onChange={(e) => set({ email: e.target.value })}
              placeholder="you@example.com"
            />
          </label>
          <label className="flex flex-col px-4 py-3">
            <span className="text-[12px] font-medium text-muted">국적</span>
            <input
              className={`mt-1 ${fieldCls}`}
              value={draft.nationality}
              maxLength={20}
              onChange={(e) => set({ nationality: e.target.value })}
              placeholder="국적"
            />
          </label>
          <button
            type="button"
            onClick={() =>
              set({
                language: LANGS[(LANGS.indexOf(draft.language) + 1) % LANGS.length],
              })
            }
            className="w-full flex flex-col items-start px-4 py-3 text-left cursor-pointer"
          >
            <span className="text-[12px] font-medium text-muted">선호 언어</span>
            <span className="mt-1 text-[15px] font-semibold text-ink">
              {draft.language}
            </span>
          </button>
        </div>
      </div>

      <div className="px-5 mt-7">
        <button
          type="button"
          onClick={save}
          disabled={!dirty || !valid}
          className="w-full h-[52px] rounded-full bg-ink text-white text-[15px] font-semibold shadow-soft cursor-pointer disabled:opacity-40 whitespace-nowrap"
        >
          저장하기
        </button>
      </div>

      <div className="h-24" />
    </div>
  );
}
