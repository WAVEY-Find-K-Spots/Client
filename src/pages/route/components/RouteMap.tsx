import { useEffect, useRef, useState, useCallback } from "react";
import type { CSSProperties } from "react";
import type { Spot } from "@/mocks/spots";
import { Crosshair, Layers, ZoomIn, ZoomOut } from "lucide-react";

type MapVariant = "empty" | "plan" | "nav";

interface RouteMapProps {
  variant: MapVariant;
  stops: Spot[];
  currentIndex?: number;
  onLocate?: () => void;
}

interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const MAP_BG =
  "linear-gradient(150deg,#E3E6D6 0%,#E9EBDB 40%,#EFEFE3 70%,#EBE7D8 100%)";

const PIN_POS = [
  { l: "22%", t: "22%" },
  { l: "62%", t: "40%" },
  { l: "38%", t: "66%" },
  { l: "16%", t: "56%" },
  { l: "66%", t: "16%" },
  { l: "54%", t: "72%" },
];

function Road({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div
      className={`absolute bg-white/60 ${className ?? ""}`}
      style={{ borderRadius: 99, ...style }}
    />
  );
}

export default function RouteMap({ variant, stops, currentIndex, onLocate }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [segs, setSegs] = useState<Segment[]>([]);

  const hasPath = variant !== "empty" && stops.length >= 2;

  useEffect(() => {
    if (!hasPath) {
      setSegs([]);
      return;
    }
    const raf = requestAnimationFrame(() => {
      const el = containerRef.current;
      if (!el) return;
      const cRect = el.getBoundingClientRect();
      const out: Segment[] = [];
      for (let i = 0; i < stops.length - 1; i++) {
        const a = pinRefs.current[i];
        const b = pinRefs.current[i + 1];
        if (!a || !b) continue;
        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();
        out.push({
          x1: ra.left - cRect.left + ra.width / 2,
          y1: ra.top - cRect.top + ra.height * 0.35,
          x2: rb.left - cRect.left + rb.width / 2,
          y2: rb.top - cRect.top + rb.height * 0.35,
        });
      }
      setSegs(out);
    });
    return () => cancelAnimationFrame(raf);
  }, [variant, stops, hasPath]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{ background: MAP_BG }}
    >
      {/* subtle grid texture */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(168,98,62,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(168,98,62,0.035) 1px, transparent 1px)",
          backgroundSize: "46px 46px",
        }}
      />
      {/* city blocks */}
      <div className="absolute left-[6%] top-[16%] w-[24%] h-[16%] rounded-[10px] bg-white/30" />
      <div className="absolute left-[42%] top-[8%] w-[18%] h-[20%] rounded-[10px] bg-white/30" />
      <div className="absolute left-[74%] top-[58%] w-[20%] h-[13%] rounded-[10px] bg-white/30" />
      <div className="absolute left-[8%] top-[68%] w-[16%] h-[12%] rounded-[10px] bg-white/25" />

      {/* decorative roads */}
      <Road className="left-[-4%] top-[42%] h-[7px] w-[80%] rotate-[8deg]" />
      <Road className="right-[-6%] top-[30%] h-[6px] w-[70%] -rotate-[14deg]" />
      <Road className="left-[-8%] bottom-[26%] h-[6px] w-[75%] rotate-[6deg]" />
      <Road className="left-[30%] top-[-4%] w-[6px] h-[55%] rotate-[18deg]" />
      <Road className="right-[16%] top-[-6%] w-[5px] h-[70%] rotate-[24deg]" />
      {/* park / water blob */}
      <div className="absolute right-[8%] top-[8%] w-[16%] h-[16%] rounded-full bg-[#DDE5D2]/80" />
      <div className="absolute left-[12%] bottom-[6%] w-[20%] h-[12%] rounded-[40%] bg-[#DCE6D8]/80" />

      {/* route connectors (drawn between pins) */}
      <div className="absolute inset-0 z-[1]">
        {segs.map((s, idx) => {
          const len = Math.hypot(s.x2 - s.x1, s.y2 - s.y1);
          const ang = (Math.atan2(s.y2 - s.y1, s.x2 - s.x1) * 180) / Math.PI;
          const isNav = variant === "nav";
          const mx = (s.x1 + s.x2) / 2;
          const my = (s.y1 + s.y2) / 2;
          return (
            <div key={idx}>
              <div
                className="absolute h-0"
                style={{
                  left: s.x1,
                  top: s.y1,
                  width: len,
                  borderTopWidth: isNav ? 3 : 2,
                  borderTopStyle: isNav ? "solid" : "dashed",
                  borderTopColor: "#A8623E",
                  transform: `rotate(${ang}deg)`,
                  transformOrigin: "0 50%",
                }}
              />
              {isNav && (
                <div
                  className="absolute w-0 h-0 border-y-[6px] border-y-transparent border-l-[10px]"
                  style={{
                    left: mx,
                    top: my,
                    borderLeftColor: "#A8623E",
                    transform: `translate(-50%,-50%) rotate(${ang}deg)`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* pins */}
      {variant !== "empty" &&
        stops.map((s, i) => {
          const pos = PIN_POS[i % PIN_POS.length];
          const emphasized = variant === "nav" && (i === 0 || i === stops.length - 1);
          const isCurrent = variant === "nav" && currentIndex === i;
          const isNext = variant === "nav" && currentIndex !== undefined && i === currentIndex + 1;
          return (
            <div
              key={s.id}
              ref={(el) => {
                pinRefs.current[i] = el;
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-[2]"
              style={{ left: pos.l, top: pos.t }}
            >
              {/* current spot pulse ring */}
              {isCurrent && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-brand/30 animate-ping z-[1]" />
              )}
              {/* next spot subtle ring */}
              {isNext && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-2 border-dashed border-brand/60 z-[1]" />
              )}
              <div className="relative z-[2]">
                <div
                  className={`flex items-center justify-center rounded-full bg-ink text-white font-bold ${
                    isCurrent ? "w-10 h-10 text-[16px]" : emphasized ? "w-9 h-9 text-[14px]" : "w-7 h-7 text-[11px]"
                  }`}
                  style={{
                    boxShadow: isCurrent
                      ? "0 0 0 5px rgba(168,98,62,0.25), 0 2px 8px rgba(44,24,16,0.25)"
                      : emphasized
                        ? "0 0 0 4px rgba(255,255,255,0.85)"
                        : "0 0 0 3px rgba(255,255,255,0.7)",
                  }}
                >
                  {i + 1}
                </div>
                {isCurrent && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full bg-brand text-white text-[10px] font-bold shadow-sm">
                    현재
                  </div>
                )}
                {isNext && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full bg-ink/80 text-white text-[10px] font-medium shadow-sm">
                    다음
                  </div>
                )}
              </div>
              <span
                className={`-mt-[1px] border-x-transparent border-t-ink ${
                  isCurrent ? "border-x-[7px] border-t-[8px]" : emphasized ? "border-x-[7px] border-t-[8px]" : "border-x-[5px] border-t-[6px]"
                }`}
              />
            </div>
          );
        })}

      {/* controls */}
      {variant === "nav" ? (
        <div className="absolute right-3 top-[92px] z-20 flex flex-col gap-2">
          {[
            { icon: Crosshair, label: "현재 위치" },
            { icon: Layers, label: "지도 레이어" },
            { icon: ZoomIn, label: "확대" },
            { icon: ZoomOut, label: "축소" },
          ].map((c, i) => {
            const Icon = c.icon;
            return (
              <button
                key={c.label}
                type="button"
                onClick={i === 0 ? onLocate : undefined}
                aria-label={c.label}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-white cursor-pointer whitespace-nowrap"
                style={{ boxShadow: "0 8px 18px rgba(44,24,16,0.16)" }}
              >
                <Icon size={17} color="#2C1810" strokeWidth={1.9} />
              </button>
            );
          })}
        </div>
      ) : (
        <button
          type="button"
          onClick={onLocate}
          aria-label="현재 위치"
          className="absolute right-3 bottom-3 z-20 flex items-center justify-center w-9 h-9 rounded-full bg-white cursor-pointer whitespace-nowrap"
          style={{ boxShadow: "0 8px 18px rgba(44,24,16,0.16)" }}
        >
          <Crosshair size={17} color="#2C1810" strokeWidth={1.9} />
        </button>
      )}
    </div>
  );
}