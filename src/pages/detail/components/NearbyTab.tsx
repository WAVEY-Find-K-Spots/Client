import type { NearbySpotView } from "@/lib/spot-adapters";
import { Star, MapPin } from "lucide-react";

interface NearbyTabProps {
  items: NearbySpotView[];
  loading?: boolean;
  isFallback?: boolean;
  onOpen: (id: string) => void;
}

export default function NearbyTab({
  items,
  loading,
  isFallback,
  onOpen,
}: NearbyTabProps) {
  return (
    <div className="px-5 pt-5">
      <p className="text-[13px] leading-relaxed text-sub mb-3">
        {isFallback
          ? "주변에 등록된 스팟이 없어서, 지금 인기 있는 스팟을 대신 보여드려요."
          : "이 장소에서 가까운 다른 K-스팟을 함께 방문해 보세요."}
      </p>
      {loading ? (
        <p className="text-center text-[13px] text-muted py-10">
          불러오는 중...
        </p>
      ) : items.length === 0 ? (
        <p className="text-center text-[13px] text-muted py-10">
          주변에 등록된 스팟이 없어요
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => onOpen(n.id)}
              className="flex items-center gap-3 bg-white rounded-2xl p-2 shadow-soft cursor-pointer text-left"
            >
              <div className="relative shrink-0 w-[74px] h-[74px] rounded-xl overflow-hidden">
                <img
                  src={n.image}
                  alt={n.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
                <span className="absolute left-1.5 top-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-white/90">
                  <Star size={9} fill="#A8623E" color="#A8623E" />
                  <span className="text-[9px] font-semibold text-ink leading-none">
                    {n.rating}
                  </span>
                </span>
                <span className="absolute left-2 bottom-1.5 text-[11px] font-semibold text-white">
                  {n.name}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-[13px] font-semibold text-ink truncate">
                    {n.name}
                  </p>
                </div>
                {n.loc && (
                  <p className="flex items-center gap-1 text-[11px] text-muted mt-0.5">
                    <span className="flex items-center justify-center w-3 h-3">
                      <MapPin size={11} />
                    </span>
                    {n.loc}
                  </p>
                )}
                <p className="text-[11px] text-sub mt-1 truncate">{n.desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
