import type { Spot } from "@/mocks/spots";
import { Star } from "lucide-react";

interface SpotCardProps {
  spot: Spot;
  onOpen: (id: string) => void;
}

export default function SpotCard({ spot, onOpen }: SpotCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(spot.id)}
      className={`relative block w-full text-left rounded-[18px] overflow-hidden cursor-pointer whitespace-nowrap ${
        spot.size === "tall" ? "aspect-[3/4.55]" : "aspect-[3/3.7]"
      } shadow-card`}
      aria-label={`${spot.name} 상세 보기`}
    >
      {/* real image backdrop */}
      <img
        src={spot.image}
        alt={spot.name}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      {/* bottom dark-brown gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/30 to-transparent" />

      {/* top-left rating pill */}
      <span className="absolute left-2.5 top-2.5 flex items-center gap-1 px-2 py-1 rounded-full bg-white/95">
        <span className="flex items-center justify-center w-3 h-3">
          <Star size={11} fill="#A8623E" color="#A8623E" />
        </span>
        <span className="text-[11px] font-semibold text-ink leading-none">
          {spot.rating.toFixed(1)}
        </span>
      </span>

      {/* top-right content type pill */}
      <span className="absolute right-2.5 top-2.5 flex items-center gap-1 px-2 py-1 rounded-full bg-ink/80 backdrop-blur-sm">
        <span className="text-[11px] font-semibold text-white/90 leading-none">
          {spot.typeLabel}
        </span>
      </span>

      {/* bottom overlay text */}
      <div className="absolute left-3 right-3 bottom-3 flex flex-col gap-1">
        <span className="text-[13px] font-semibold text-white leading-none">
          {spot.name}
        </span>
        <span className="text-[10px] text-[#D9A88A] leading-tight whitespace-normal line-clamp-1">
          {spot.desc}
        </span>
      </div>
    </button>
  );
}