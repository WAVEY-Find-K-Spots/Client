import { useMemo } from "react";
import type { StampItem } from "@/mocks/stamps";
import {
  X,
  Check,
  Star,
  Share2,
  BookOpen,
} from "lucide-react";

interface AcquiredOverlayProps {
  stamp: StampItem;
  onClose: () => void;
  onShowBook: () => void;
}

const particles = [
  { top: "-8%", left: "18%" },
  { top: "6%", right: "2%" },
  { bottom: "4%", left: "6%" },
  { bottom: "-6%", right: "22%" },
];

function formatVisitDate(short?: string): string {
  if (!short) return "";
  const [y, m, d] = short.split(".");
  return `${y}년 ${parseInt(m, 10)}월 ${parseInt(d, 10)}일 방문`;
}

export default function AcquiredOverlay({
  stamp,
  onClose,
  onShowBook,
}: AcquiredOverlayProps) {
  const dateLabel = useMemo(() => formatVisitDate(stamp.dateShort), [stamp]);

  return (
    <div className="absolute inset-0 z-[60] bg-ink flex flex-col overflow-hidden">
      {/* 상단 */}
      <div className="flex items-center justify-between px-5 pt-4 shrink-0">
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="flex items-center justify-center w-9 h-9 rounded-full cursor-pointer whitespace-nowrap"
        >
          <span className="flex items-center justify-center w-5 h-5">
            <X size={20} color="#FFFFFF" strokeWidth={1.8} />
          </span>
        </button>
        <span className="text-[16px] font-semibold text-white">스탬프 획득</span>
        <span className="w-9 h-9" />
      </div>

      {/* 중앙 애니메이션 영역 */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-6">
        <div className="relative wv-pop">
          {/* 바깥 점선 링 */}
          <div
            className="absolute -inset-5 rounded-full"
            style={{ border: "2px dashed #A8623E" }}
          />
          {/* 파티클 */}
          {particles.map((p, i) => (
            <span
              key={i}
              className="absolute wv-float flex items-center justify-center w-3 h-3"
              style={{ ...p, animationDelay: `${i * 0.35}s` }}
            >
              <Star size={12} color="#A8623E" fill="#A8623E" />
            </span>
          ))}
          {/* 안쪽 링 */}
          <div
            className="absolute -inset-3 rounded-full opacity-0 wv-ring-grow"
            style={{ border: "1px solid rgba(168,98,62,0.5)" }}
          />
          {/* 스탬프 원 */}
          <div className="w-[200px] h-[200px] rounded-full p-5 bg-cream">
            <div
              className="w-full h-full rounded-full flex items-center justify-center"
              style={{ background: stamp.gradient }}
            >
              <span className="flex items-center justify-center w-8 h-8">
                <Check size={32} color="#FFFFFF" strokeWidth={2.6} />
              </span>
            </div>
          </div>
        </div>

        {/* 획득 정보 */}
        <div className="mt-9 text-center">
          <h2 className="text-[24px] font-extrabold tracking-tight text-white">
            {stamp.name} 스탬프 획득
          </h2>
          <p className="mt-1.5 text-[13px] text-muted">{dateLabel}</p>
          {stamp.kContent && (
            <span className="mt-3 inline-flex items-center px-3.5 h-8 rounded-full bg-[#4A2C1A]">
              <span className="text-[13px] font-medium text-brand">
                {stamp.kContent}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="px-5 pb-8 shrink-0 flex items-center gap-2.5">
        <button
          type="button"
          onClick={onShowBook}
          className="flex-1 h-[52px] rounded-full bg-[#4A2C1A] text-white text-[14px] font-semibold cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5"
        >
          <span className="flex items-center justify-center w-4 h-4">
            <BookOpen size={15} color="#FFFFFF" />
          </span>
          스탬프북 보기
        </button>
        <button
          type="button"
          className="flex-1 h-[52px] rounded-full bg-brand text-white text-[14px] font-semibold cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5"
        >
          <span className="flex items-center justify-center w-4 h-4">
            <Share2 size={15} color="#FFFFFF" />
          </span>
          공유하기
        </button>
      </div>
    </div>
  );
}