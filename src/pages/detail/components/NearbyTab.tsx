import type { Spot } from "@/mocks/spots";
import { spots } from "@/mocks/spots";
import { Star, MapPin } from "lucide-react";

interface NearbyTabProps {
  spot: Spot;
  onOpen: (id: string) => void;
}

export default function NearbyTab({ spot, onOpen }: NearbyTabProps) {
  const nearby = spots.filter((s) => s.id !== spot.id).slice(0, 4);

  return (
    <div className="px-5 pt-5">
      <p className="text-[13px] leading-relaxed text-sub mb-3">
        이 장소에서 가까운 다른 K-스팟을 함께 방문해 보세요.
      </p>
      <div className="flex flex-col gap-3">
        {nearby.map((n) => (
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
              <p className="flex items-center gap-1 text-[11px] text-muted mt-0.5">
                <span className="flex items-center justify-center w-3 h-3">
                  <MapPin size={11} />
                </span>
                {n.loc}
              </p>
              <p className="text-[11px] text-sub mt-1 truncate">{n.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}