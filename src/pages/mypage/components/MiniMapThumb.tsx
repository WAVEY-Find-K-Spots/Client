import { useEffect, useRef, useState } from "react";

interface MiniMapThumbProps {
  count: number;
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
  { l: "20%", t: "24%" },
  { l: "54%", t: "18%" },
  { l: "72%", t: "50%" },
  { l: "40%", t: "64%" },
  { l: "16%", t: "72%" },
];

export default function MiniMapThumb({ count }: MiniMapThumbProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [segs, setSegs] = useState<Segment[]>([]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const el = containerRef.current;
      if (!el) return;
      const c = el.getBoundingClientRect();
      const out: Segment[] = [];
      for (let i = 0; i < count - 1; i++) {
        const a = pinRefs.current[i];
        const b = pinRefs.current[i + 1];
        if (!a || !b) continue;
        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();
        out.push({
          x1: ra.left - c.left + ra.width / 2,
          y1: ra.top - c.top + ra.height / 2,
          x2: rb.left - c.left + rb.width / 2,
          y2: rb.top - c.top + rb.height / 2,
        });
      }
      setSegs(out);
    });
    return () => cancelAnimationFrame(raf);
  }, [count]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[120px] overflow-hidden"
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
      <div className="absolute left-[6%] top-[16%] w-[24%] h-[16%] rounded-[10px] bg-white/35" />
      <div className="absolute left-[42%] top-[8%] w-[18%] h-[18%] rounded-[10px] bg-white/35" />
      <div className="absolute left-[74%] top-[62%] w-[20%] h-[12%] rounded-[10px] bg-white/30" />
      <div className="absolute left-[10%] bottom-[8%] w-[18%] h-[12%] rounded-[10px] bg-white/25" />
      {/* decorative roads */}
      <div className="absolute left-[-4%] top-[42%] h-[7px] w-[80%] bg-white/55 rounded-full rotate-[8deg]" />
      <div className="absolute right-[-6%] top-[30%] h-[6px] w-[70%] bg-white/55 rounded-full -rotate-[14deg]" />
      <div className="absolute left-[-8%] bottom-[24%] h-[6px] w-[75%] bg-white/55 rounded-full rotate-[6deg]" />
      <div className="absolute left-[30%] top-[-4%] w-[6px] h-[55%] bg-white/50 rounded-full rotate-[18deg]" />
      {/* park / water */}
      <div className="absolute right-[8%] top-[8%] w-[16%] h-[14%] rounded-full bg-[#DDE5D2]/80" />
      <div className="absolute left-[14%] bottom-[4%] w-[18%] h-[11%] rounded-[40%] bg-[#DCE6D8]/80" />

      {/* route connectors */}
      <div className="absolute inset-0 z-[1]">
        {segs.map((s, idx) => {
          const len = Math.hypot(s.x2 - s.x1, s.y2 - s.y1);
          const ang = (Math.atan2(s.y2 - s.y1, s.x2 - s.x1) * 180) / Math.PI;
          return (
            <div
              key={idx}
              className="absolute h-0"
              style={{
                left: s.x1,
                top: s.y1,
                width: len,
                borderTop: "2px dashed #A8623E",
                transform: `rotate(${ang}deg)`,
                transformOrigin: "0 50%",
              }}
            />
          );
        })}
      </div>

      {/* pins */}
      {Array.from({ length: count }).map((_, i) => {
        const pos = PIN_POS[i % PIN_POS.length];
        return (
          <div
            key={i}
            ref={(el) => {
              pinRefs.current[i] = el;
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-full bg-ink text-white text-[11px] font-bold z-[2]"
            style={{
              left: pos.l,
              top: pos.t,
              boxShadow: "0 0 0 3px rgba(255,255,255,0.85)",
            }}
          >
            {i + 1}
          </div>
        );
      })}
    </div>
  );
}