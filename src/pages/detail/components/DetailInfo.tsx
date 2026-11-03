import { useState } from "react";
import { createPortal } from "react-dom";
import type { Spot } from "@/mocks/spots";
import SpotLocationMap, { SpotMapOverlay } from "./SpotLocationMap";
import { Clock, MapPin, Train, Phone, Navigation, Maximize2 } from "lucide-react";

interface Row {
  icon: typeof Clock;
  label: string;
  value: string;
  sub?: string;
}

export default function DetailInfo({ spot }: { spot: Spot }) {
  const [mapOpen, setMapOpen] = useState(false);
  const rows: Row[] = [
    {
      icon: Clock,
      label: "운영시간",
      value: spot.info.hours,
      sub: spot.info.hoursNote,
    },
    { icon: MapPin, label: "주소", value: spot.info.address },
    { icon: Train, label: "교통편", value: spot.info.transport },
    { icon: Phone, label: "문의", value: spot.info.phone },
  ];

  return (
    <div className="px-5 pt-4">
      {/* info white card */}
      <div className="bg-white rounded-2xl py-1 shadow-soft">
        {rows.map((row, i) => {
          const Icon = row.icon;
          return (
            <div
              key={row.label}
              className={`flex items-start gap-3 px-4 py-3 ${
                i < rows.length - 1 ? "border-b border-line/60" : ""
              }`}
            >
              <span className="mt-0.5 flex items-center justify-center w-5 h-5 shrink-0">
                <Icon size={19} color="#A8623E" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-ink">
                  {row.label}
                </p>
                <p className="text-[13px] text-sub mt-0.5 leading-snug">
                  {row.value}
                </p>
                {row.sub && (
                  <p className="text-[11px] text-muted mt-0.5">{row.sub}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* mini map preview */}
      <button
        type="button"
        onClick={() => setMapOpen(true)}
        aria-label={`${spot.name} 지도에서 보기`}
        className="mt-4 relative isolate block w-full h-[150px] rounded-2xl overflow-hidden bg-cream cursor-pointer"
      >
        <SpotLocationMap
          coord={spot.coord}
          name={spot.name}
          className="absolute inset-0 pointer-events-none"
        />
        <span className="absolute z-[1000] left-1/2 bottom-3 -translate-x-1/2 flex items-center gap-1.5 px-3 h-8 rounded-full bg-white/95 shadow-soft">
          <span className="flex items-center justify-center w-4 h-4">
            <Navigation size={13} color="#A8623E" />
          </span>
          <span className="text-[12px] font-medium text-ink whitespace-nowrap">
            지도에서 보기
          </span>
        </span>
        <span className="absolute z-[1000] right-3 top-3 flex items-center justify-center w-7 h-7 rounded-lg bg-white/90">
          <Maximize2 size={13} color="#2C1810" />
        </span>
      </button>

      {mapOpen &&
        createPortal(
          <SpotMapOverlay
            coord={spot.coord}
            name={spot.name}
            address={spot.info.address}
            onClose={() => setMapOpen(false)}
          />,
          document.getElementById("phone-frame") ?? document.body,
        )}
    </div>
  );
}
