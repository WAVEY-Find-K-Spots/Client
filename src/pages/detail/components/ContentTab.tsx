import type { Spot } from "@/mocks/spots";
import { Play, ChevronRight, Music, MapPin } from "lucide-react";

export default function ContentTab({ spot }: { spot: Spot }) {
  return (
    <div className="px-5 pt-5">
      {/* Related dramas */}
      <h4 className="text-[15px] font-semibold text-ink">연관 드라마</h4>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {spot.dramas.map((d) => (
          <div
            key={d.title}
            className="bg-white rounded-2xl overflow-hidden shadow-soft cursor-pointer"
          >
            <div className="relative w-full h-[70px] overflow-hidden">
              <img
                src={d.image}
                alt={d.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-ink/35 backdrop-blur-sm">
                  <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
                </span>
              </span>
            </div>
            <div className="p-3">
              <p className="text-[13px] font-semibold text-ink leading-tight">
                {d.title}
              </p>
              <p className="text-[10px] text-muted mt-1">{d.eps}</p>
              <p className="flex items-center gap-0.5 text-[11px] font-medium text-brand mt-1.5">
                촬영 장면 보기
                <span className="flex items-center justify-center w-3 h-3">
                  <ChevronRight size={12} />
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* shooting scene */}
      <div className="mt-4 rounded-xl border border-cta bg-cream p-4">
        <h4 className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
          <span className="flex items-center justify-center w-4 h-4">
            <MapPin size={15} color="#A8623E" />
          </span>
          {spot.sceneTitle}
        </h4>
        <p className="mt-2 text-[13px] leading-relaxed text-sub">
          {spot.sceneDesc}
        </p>
      </div>

      {/* related music */}
      <h4 className="mt-5 text-[15px] font-semibold text-ink">연관 음악</h4>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {spot.music.map((m) => (
          <div
            key={m.title}
            className="bg-white rounded-2xl p-2 flex items-center gap-2.5 shadow-soft cursor-pointer"
          >
            <div className="relative shrink-0 w-[60px] h-[60px] rounded-xl overflow-hidden">
              <img
                src={m.image}
                alt={m.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-ink/30">
                  <Play size={12} color="#FFFFFF" fill="#FFFFFF" />
                </span>
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-ink truncate">
                {m.title}
              </p>
              <p className="text-[10px] text-muted truncate mt-0.5">
                {m.artist}
              </p>
              <div className="mt-1.5 flex items-center gap-1">
                <div className="flex-1 h-[3px] rounded-full bg-line">
                  <div
                    className="h-full rounded-full"
                    style={{ width: "68%", backgroundColor: "#A8623E" }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Spotify CTA */}
      <button
        type="button"
        className="mt-3 w-full h-[50px] rounded-full flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
        style={{ backgroundColor: "#1DB954" }}
      >
        <span className="flex items-center justify-center w-5 h-5">
          <Music size={18} color="#FFFFFF" fill="#FFFFFF" />
        </span>
        <span className="text-[14px] font-semibold text-white">
          Spotify에서 플레이리스트 열기
        </span>
      </button>

      {/* related videos */}
      <h4 className="mt-5 text-[15px] font-semibold text-ink">연관 영상</h4>
      <div className="mt-3 grid grid-cols-3 gap-2.5">
        {spot.videos.map((v) => (
          <div
            key={v.label}
            className="relative h-[88px] rounded-xl overflow-hidden cursor-pointer"
          >
            <img
              src={v.image}
              alt={v.label}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-ink/35 backdrop-blur-sm">
                <Play size={12} color="#FFFFFF" fill="#FFFFFF" />
              </span>
            </span>
            <span className="absolute left-2 bottom-1.5 right-2 text-[9px] text-white/95 truncate whitespace-nowrap">
              {v.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}