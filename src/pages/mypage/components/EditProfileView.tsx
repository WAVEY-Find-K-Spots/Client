import StatusBar from "@/components/layout/StatusBar";
import { ChevronLeft, User, Camera, ChevronRight } from "lucide-react";

interface EditProfileViewProps {
  onBack: () => void;
  onToast: (msg: string) => void;
}

const rows = [
  { label: "닉네임", value: "여행자_시영" },
  { label: "이메일", value: "siyoung@wavey.kr" },
  { label: "국적", value: "대한민국" },
  { label: "선호 언어", value: "한국어" },
];

export default function EditProfileView({
  onBack,
  onToast,
}: EditProfileViewProps) {
  const save = () => {
    onToast("프로필을 저장했어요");
    onBack();
  };

  return (
    <div className="min-h-full bg-page">
      <StatusBar variant="dark" />

      {/* 헤더 */}
      <div className="px-5 pt-1 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로가기"
          className="flex items-center justify-center w-9 h-9 rounded-2xl bg-cream cursor-pointer whitespace-nowrap"
        >
          <span className="flex items-center justify-center w-4 h-4">
            <ChevronLeft size={20} color="#2C1810" strokeWidth={2} />
          </span>
        </button>
        <span className="text-[18px] font-semibold text-ink">프로필 편집</span>
        <button
          type="button"
          onClick={save}
          className="text-[14px] font-semibold text-brand cursor-pointer whitespace-nowrap"
        >
          저장
        </button>
      </div>

      {/* 프로필 이미지 */}
      <div className="px-5 mt-8 flex flex-col items-center">
        <button
          type="button"
          onClick={() => onToast("사진 변경 기능이 곧 열려요")}
          className="relative cursor-pointer"
          aria-label="프로필 사진"
        >
          <span
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#A8623E,#6B3F28)" }}
          >
            <span className="flex items-center justify-center w-10 h-10">
              <User size={40} color="#FFFFFF" strokeWidth={1.6} />
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => onToast("사진 변경 기능이 곧 열려요")}
          className="mt-3 h-9 px-4 rounded-full bg-cream flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <span className="flex items-center justify-center w-3.5 h-3.5">
            <Camera size={14} color="#A8623E" strokeWidth={2} />
          </span>
          <span className="text-[12px] font-medium text-brand">사진 변경</span>
        </button>
      </div>

      {/* 입력 폼 카드 */}
      <div className="px-5 mt-7">
        <div className="bg-white rounded-[16px] shadow-soft overflow-hidden divide-y divide-[#F5F1EE]">
          {rows.map((r) => (
            <button
              key={r.label}
              type="button"
              onClick={() => onToast(`${r.label} 입력창이 곧 열려요`)}
              className="w-full flex items-center px-4 h-16 cursor-pointer text-left"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-muted">
                  {r.label}
                </p>
                <p className="text-[15px] font-semibold text-ink mt-0.5 truncate">
                  {r.value}
                </p>
              </div>
              <span className="flex items-center justify-center w-4 h-4 shrink-0 ml-3">
                <ChevronRight size={16} color="#DDD4CE" strokeWidth={2} />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 저장 */}
      <div className="px-5 mt-7">
        <button
          type="button"
          onClick={save}
          className="w-full h-[52px] rounded-full bg-ink text-white text-[15px] font-semibold shadow-soft cursor-pointer whitespace-nowrap"
        >
          저장하기
        </button>
      </div>

      <div className="h-24" />
    </div>
  );
}