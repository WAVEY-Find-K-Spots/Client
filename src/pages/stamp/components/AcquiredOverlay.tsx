import { useMemo } from "react";
import { X, Check, Star, Share2, BookOpen } from "lucide-react";
import type { OverlayStamp } from "../adapters";
import StampAvatar from "./StampAvatar";

interface AcquiredOverlayProps {
  stamp: OverlayStamp;
  onClose: () => void;
  onShowBook: () => void;
  onShare?: () => void;
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
  onShare,
}: AcquiredOverlayProps) {
  const dateLabel = useMemo(() => formatVisitDate(stamp.dateShort), [stamp]);

  return (
    <div className="absolute inset-0 z-[60] bg-ink flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-4 shrink-0">
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="flex items-center justify-center w-9 h-9 rounded-full cursor-pointer whitespace-nowrap"
        >
          <X size={20} color="#FFFFFF" strokeWidth={1.8} />
        </button>
        <span className="text-[16px] font-semibold text-white">스탬프 획득</span>
        <span className="w-9 h-9" />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
        <div className="min-h-full flex flex-col items-center justify-center px-6 py-6">
          <div className="relative wv-pop">
            <div
              className="absolute -inset-5 rounded-full"
              style={{ border: "2px dashed #A8623E" }}
            />
            {particles.map((p, i) => (
              <span
                key={i}
                className="absolute wv-float flex items-center justify-center w-3 h-3"
                style={{ ...p, animationDelay: `${i * 0.35}s` }}
              >
                <Star size={12} color="#A8623E" fill="#A8623E" />
              </span>
            ))}
            <div
              className="absolute -inset-3 rounded-full opacity-0 wv-ring-grow"
              style={{ border: "1px solid rgba(168,98,62,0.5)" }}
            />
            <div className="w-[200px] h-[200px] rounded-full p-5 bg-cream">
              {stamp.imageUrl ? (
                <StampAvatar
                  name={stamp.name}
                  imageUrl={stamp.imageUrl}
                  size={160}
                  showCheck
                />
              ) : (
                <div
                  className="w-full h-full rounded-full flex items-center justify-center"
                  style={{
                    background:
                      stamp.gradient ??
                      "linear-gradient(158deg,#7a3d28,#c96a42)",
                  }}
                >
                  <Check size={32} color="#FFFFFF" strokeWidth={2.6} />
                </div>
              )}
            </div>
          </div>

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
      </div>

      <div className="px-5 pb-8 shrink-0 flex items-center gap-2.5">
        <button
          type="button"
          onClick={onShowBook}
          className="flex-1 h-[52px] rounded-full bg-[#4A2C1A] text-white text-[14px] font-semibold cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5"
        >
          <BookOpen size={15} color="#FFFFFF" />
          스탬프북 보기
        </button>
        <button
          type="button"
          onClick={onShare}
          className="flex-1 h-[52px] rounded-full bg-brand text-white text-[14px] font-semibold cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5"
        >
          <Share2 size={15} color="#FFFFFF" />
          공유하기
        </button>
      </div>
    </div>
  );
}
