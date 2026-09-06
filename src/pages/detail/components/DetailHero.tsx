import { useState } from "react";
import type { Spot } from "@/mocks/spots";
import StatusBar from "@/components/layout/StatusBar";
import { ChevronLeft, Heart, Share2 } from "lucide-react";

interface DetailHeroProps {
  spot: Spot;
  collapsed: boolean;
  onBack: () => void;
}

export default function DetailHero({ spot, collapsed, onBack }: DetailHeroProps) {
  const [liked, setLiked] = useState(false);

  const height = collapsed ? "h-[200px]" : "h-[320px]";

  return (
    <div className={`relative w-full ${height} overflow-hidden rounded-b-[26px]`}>
      <img
        src={spot.image}
        alt={spot.name}
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* dark bottom overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent" />

      {/* status bar */}
      <div className="absolute top-0 inset-x-0">
        <StatusBar variant="light" />
      </div>

      {/* top actions */}
      <div className="absolute top-[52px] inset-x-0 px-5 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-ink/35 backdrop-blur-sm cursor-pointer"
          aria-label="뒤로 가기"
        >
          <ChevronLeft size={20} color="#FFFFFF" strokeWidth={2.2} />
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLiked((v) => !v)}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-ink/35 backdrop-blur-sm cursor-pointer"
            aria-label="좋아요"
          >
            <Heart
              size={18}
              strokeWidth={2}
              color="#FFFFFF"
              fill={liked ? "#FFFFFF" : "transparent"}
            />
          </button>
          <button
            type="button"
            onClick={() => {
              try {
                navigator.share?.({ title: spot.name, url: window.location.href });
              } catch {
                /* ignore */
              }
            }}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-ink/35 backdrop-blur-sm cursor-pointer"
            aria-label="공유"
          >
            <Share2 size={18} strokeWidth={2} color="#FFFFFF" />
          </button>
        </div>
      </div>

      {/* bottom name overlay */}
      <div className="absolute inset-x-0 bottom-0 px-5 pb-5">
        <h1 className="text-[28px] font-extrabold text-white leading-tight tracking-tight">
          {spot.name}
        </h1>
        <p className="text-[13px] text-[#D9A88A] mt-0.5">{spot.loc}</p>
      </div>
    </div>
  );
}