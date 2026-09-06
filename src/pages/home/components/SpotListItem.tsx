import type { ReactNode } from "react";
import type { Spot } from "@/mocks/spots";
import { Star, Heart, MapPin } from "lucide-react";
import { getDistanceKm, formatKm } from "../distance";

interface SpotListItemProps {
  spot: Spot;
  query?: string;
  saved: boolean;
  onToggleSave: () => void;
  onOpen: () => void;
}

function renderHighlight(text: string, query?: string): ReactNode {
  const q = query?.trim().toLowerCase();
  if (!q) return text;
  const lower = text.toLowerCase();
  const idx = lower.indexOf(q);
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-brand">{text.slice(idx, idx + q.length)}</span>
      {text.slice(idx + q.length)}
    </>
  );
}

export default function SpotListItem({
  spot,
  query,
  saved,
  onToggleSave,
  onOpen,
}: SpotListItemProps) {
  const reviewText = `${spot.reviewCount.toLocaleString("ko-KR")}개`;
  const distText = formatKm(getDistanceKm(spot));

  return (
    <div
      className="flex items-center gap-3 w-full bg-white rounded-[16px] p-3 cursor-pointer shadow-soft"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen();
      }}
      aria-label={`${spot.name} 상세 보기`}
    >
      {/* thumbnail */}
      <div className="relative shrink-0 w-[88px] h-[88px] rounded-[12px] overflow-hidden">
        <img
          src={spot.image}
          alt={spot.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <span className="absolute left-1.5 top-1.5 px-1.5 py-0.5 rounded-md bg-ink/80 text-white text-[9px] font-medium leading-none">
          {spot.typeLabel}
        </span>
      </div>

      {/* info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between h-[88px] py-0.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[15px] font-semibold text-ink leading-tight truncate">
            {renderHighlight(spot.name, query)}
          </p>
          <span className="shrink-0 flex items-center gap-0.5 text-[10px] text-muted">
            <span className="flex items-center justify-center w-2.5 h-2.5">
              <MapPin size={10} color="#A8623E" strokeWidth={2.4} />
            </span>
            <span className="whitespace-nowrap">{distText}</span>
          </span>
        </div>
        <p className="text-[12px] text-muted leading-tight truncate">
          {spot.desc}
        </p>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[11px] text-muted">
            <span className="flex items-center justify-center w-3 h-3">
              <Star size={11} color="#A8623E" fill="#A8623E" />
            </span>
            <span className="font-medium text-ink">{spot.rating.toFixed(1)}</span>
            <span className="mx-0.5 text-[#DDD4CE]">·</span>
            <span>{reviewText}</span>
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave();
            }}
            className="flex items-center justify-center w-7 h-7 rounded-full cursor-pointer"
            aria-label="저장"
          >
            <Heart
              size={16}
              strokeWidth={2}
              color={saved ? "#A8623E" : "#DDD4CE"}
              fill={saved ? "#A8623E" : "transparent"}
            />
          </button>
        </div>
      </div>
    </div>
  );
}