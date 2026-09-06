import type { Spot } from "@/mocks/spots";
import { Star } from "lucide-react";

export default function RatingBlock({ spot }: { spot: Spot }) {
  return (
    <div className="px-5 pt-4">
      {/* rating row */}
      <div className="flex items-center gap-1.5">
        <span className="flex items-center justify-center w-5 h-5">
          <Star size={16} fill="#A8623E" color="#A8623E" />
        </span>
        <span className="text-[16px] font-bold text-ink">{spot.rating}</span>
        <span className="text-[13px] font-medium text-ink ml-1">매우 훌륭함</span>
        <span className="text-[12px] text-muted ml-auto">
          (리뷰 {spot.reviewCount.toLocaleString()}개)
        </span>
      </div>

      {/* content tags */}
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        {spot.tags.map((t) => (
          <span
            key={t}
            className="px-3 h-[30px] rounded-[13px] bg-ink flex items-center"
          >
            <span className="text-[12px] font-medium text-white leading-none">
              {t}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}