import type { Spot } from "@/mocks/spots";
import { Clock, MapPin, Train, Phone, Navigation, Maximize2 } from "lucide-react";

interface Row {
  icon: typeof Clock;
  label: string;
  value: string;
  sub?: string;
}

export default function DetailInfo({ spot }: { spot: Spot }) {
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
      <div
        className="mt-4 relative w-full h-[150px] rounded-2xl overflow-hidden"
        style={{
          background:
            "linear-gradient(140deg, #e8e2c4 0%, #d7dcc2 45%, #cfd8c0 100%)",
        }}
      >
        {/* decorative roads */}
        <div className="absolute left-0 right-0 top-0 bottom-0 opacity-90">
          <div className="absolute top-1/2 left-0 w-full h-[6px] -rotate-6 bg-white/85" />
          <div className="absolute left-1/3 top-0 w-[5px] h-full rotate-12 bg-white/80" />
          <div className="absolute left-2/3 top-0 w-[4px] h-full -rotate-6 bg-white/70" />
          <div className="absolute top-2/3 left-0 w-full h-[4px] rotate-3 bg-white/75" />
        </div>
        {/* pin */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[110%] flex flex-col items-center">
          <span className="flex items-center justify-center w-9 h-9 rounded-full bg-white shadow-soft">
            <MapPin size={18} color="#A8623E" />
          </span>
          <span className="mt-1 w-2.5 h-2.5 rounded-full bg-brand blur-[1px] opacity-70" />
        </div>
        {/* label */}
        <div className="absolute left-1/2 bottom-3 -translate-x-1/2 flex items-center gap-1.5 px-3 h-8 rounded-full bg-white/95 shadow-soft cursor-pointer">
          <span className="flex items-center justify-center w-4 h-4">
            <Navigation size={13} color="#A8623E" />
          </span>
          <span className="text-[12px] font-medium text-ink whitespace-nowrap">
            지도에서 보기
          </span>
        </div>
        {/* fullscreen hint */}
        <span className="absolute right-3 top-3 flex items-center justify-center w-7 h-7 rounded-lg bg-white/90 cursor-pointer">
          <Maximize2 size={13} color="#2C1810" />
        </span>
      </div>
    </div>
  );
}