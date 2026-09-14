import { useMemo } from "react";
import { X, Award, Share2, Star } from "lucide-react";

export type OverlayBadge = {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  dateShort?: string;
};

interface BadgeAcquiredOverlayProps {
  badge: OverlayBadge;
  onClose: () => void;
  onShowBadges: () => void;
  onShare?: () => void;
}

const particles = [
  { top: "-10%", left: "12%" },
  { top: "4%", right: "0%" },
  { bottom: "2%", left: "2%" },
  { bottom: "-8%", right: "18%" },
];

const HEX =
  "polygon(50% 0%,90% 25%,90% 75%,50% 100%,10% 75%,10% 25%)";

function formatDate(short?: string): string {
  if (!short) return "";
  const [y, m, d] = short.split(".");
  return `${y}년 ${parseInt(m, 10)}월 ${parseInt(d, 10)}일 획득`;
}

export default function BadgeAcquiredOverlay({
  badge,
  onClose,
  onShowBadges,
  onShare,
}: BadgeAcquiredOverlayProps) {
  const dateLabel = useMemo(() => formatDate(badge.dateShort), [badge]);

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
        <span className="text-[16px] font-semibold text-white">뱃지 획득</span>
        <span className="w-9 h-9" />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
        <div className="min-h-full flex flex-col items-center justify-center px-6 py-6">
          <div className="relative wv-pop">
            {/* 바깥 육각 점선 느낌 — 원형 링으로 통일감 */}
            <div
              className="absolute -inset-6 rounded-full"
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
              className="absolute -inset-4 rounded-full opacity-0 wv-ring-grow"
              style={{ border: "1px solid rgba(168,98,62,0.5)" }}
            />

            {/* 육각 배지 */}
            <div className="w-[180px] h-[180px] flex items-center justify-center">
              <div
                className="relative w-[160px] h-[160px] overflow-hidden"
                style={{
                  clipPath: HEX,
                  background: badge.imageUrl
                    ? undefined
                    : "linear-gradient(160deg,#A8623E,#6B3F28)",
                }}
              >
                {badge.imageUrl ? (
                  <img
                    src={badge.imageUrl}
                    alt={badge.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Award size={56} color="#FFFFFF" strokeWidth={1.6} />
                  </span>
                )}
                <span className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
              </div>
            </div>
          </div>

          <div className="mt-9 text-center">
            <p className="text-[13px] font-medium text-brand">새로운 뱃지 해제</p>
            <h2 className="mt-1.5 text-[24px] font-extrabold tracking-tight text-white">
              {badge.name}
            </h2>
            {badge.description && (
              <p className="mt-2 text-[13px] text-muted leading-relaxed px-2">
                {badge.description}
              </p>
            )}
            {dateLabel && (
              <p className="mt-2 text-[12px] text-muted">{dateLabel}</p>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 pb-8 shrink-0 flex items-center gap-2.5">
        <button
          type="button"
          onClick={onShowBadges}
          className="flex-1 h-[52px] rounded-full bg-[#4A2C1A] text-white text-[14px] font-semibold cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5"
        >
          <Award size={15} color="#FFFFFF" />
          뱃지함 보기
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
