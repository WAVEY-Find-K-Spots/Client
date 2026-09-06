import { useEffect, useRef, useState, useCallback } from "react";
import type { Spot } from "@/mocks/spots";
import { ChevronLeft, Repeat, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";

const MINI_COLLAPSED = 92;
const MINI_EXPANDED = 260;

interface NavOverlayProps {
  stops: Spot[];
  current: number;
  onBack: () => void;
  onSwap: () => void;
  onPrev: () => void;
  onNext: () => void;
  travelToNext: (index: number) => string;
}

export default function NavOverlay({
  stops,
  current,
  onBack,
  onSwap,
  onPrev,
  onNext,
  travelToNext,
}: NavOverlayProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const handleRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ startY: 0, moved: false });

  const toggle = useCallback(() => setIsExpanded((p) => !p), []);

  useEffect(() => {
    const el = handleRef.current;
    if (!el) return;

    const onPointerDown = (e: PointerEvent) => {
      dragRef.current = { startY: e.clientY, moved: false };
      el.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      const delta = dragRef.current.startY - e.clientY;
      if (Math.abs(delta) > 8) dragRef.current.moved = true;
    };

    const onPointerUp = (e: PointerEvent) => {
      const delta = dragRef.current.startY - e.clientY;
      if (Math.abs(delta) > 50) {
        if (delta > 0) setIsExpanded(true);
        else setIsExpanded(false);
      } else if (!dragRef.current.moved) {
        toggle();
      }
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
    };
  }, [toggle]);

  if (stops.length === 0) return null;
  const startName = stops[0].name;
  const endName = stops[stops.length - 1].name;
  const cur = stops[current];
  const isLast = current >= stops.length - 1;
  const nextSpot = isLast ? null : stops[current + 1];
  const progress = Math.min(((current + 1) / stops.length) * 100, 100);

  return (
    <div className="absolute inset-0 z-10 flex flex-col justify-between pointer-events-none">
      {/* top overlay bar */}
      <div className="px-4 pt-2 pointer-events-auto">
        <div className="h-[48px] rounded-[16px] bg-white flex items-center px-2.5"
          style={{ boxShadow: "0 8px 20px rgba(44,24,16,0.16)" }}>
          <button
            type="button"
            onClick={onBack}
            aria-label="뒤로"
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-cream cursor-pointer shrink-0"
          >
            <ChevronLeft size={20} color="#2C1810" strokeWidth={2.2} />
          </button>
          <p className="flex-1 text-center text-[14px] font-semibold text-ink truncate px-1">
            {startName}
            <span className="mx-1.5 text-brand">→</span>
            {endName}
          </p>
          <button
            type="button"
            onClick={onSwap}
            aria-label="출발·도착 반대로"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-cream cursor-pointer shrink-0"
          >
            <Repeat size={17} color="#A8623E" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* bottom mini sheet */}
      <div className="px-4 pb-2 pointer-events-auto">
        <div
          className="rounded-t-[26px] rounded-b-[18px] bg-white px-5 pt-3 pb-4 overflow-hidden flex flex-col"
          style={{
            boxShadow: "0 -10px 30px rgba(44,24,16,0.18)",
            height: isExpanded ? MINI_EXPANDED : MINI_COLLAPSED,
            transition: "height 0.3s ease-out",
          }}
        >
          {/* drag handle */}
          <div
            ref={handleRef}
            className="flex flex-col items-center pt-2.5 pb-2 gap-2 cursor-pointer select-none"
          >
            <span className="w-10 h-1 rounded-full bg-line" />
            <span className="flex items-center justify-center w-4 h-4">
              {isExpanded ? (
                <ChevronDown size={15} color="#A89890" strokeWidth={2.4} />
              ) : (
                <ChevronUp size={15} color="#A89890" strokeWidth={2.4} />
              )}
            </span>
          </div>

          {isExpanded ? (
            <>
              <p className="text-[15px] font-semibold text-ink mt-1">
                {current + 1}번 {cur.name}에서 출발
              </p>
              <p className="text-[13px] text-muted mt-1">
                {isLast
                  ? "모든 스팟을 둘러봤어요. 도착했어요!"
                  : `다음: ${nextSpot!.name}까지 ${travelToNext(current)}`}
              </p>

              {/* progress bar */}
              <div className="mt-3 h-1.5 rounded-full bg-line overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[11px] text-muted mt-1.5 text-right">
                {Math.min(current + 1, stops.length)} / {stops.length} 스팟 완료
              </p>

              {/* prev / next buttons */}
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={onPrev}
                  disabled={current === 0}
                  className="h-[46px] flex-1 rounded-full bg-cream text-ink text-[13px] font-semibold flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap disabled:opacity-40"
                >
                  <ChevronLeft size={17} strokeWidth={2.2} />
                  이전 스팟
                </button>
                <button
                  type="button"
                  onClick={onNext}
                  className="h-[46px] flex-1 rounded-full bg-ink text-white text-[13px] font-semibold flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  {isLast ? "완료" : "다음 스팟"}
                  <ChevronRight size={17} strokeWidth={2.2} color="#FFFFFF" />
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={toggle}
              className="flex items-center justify-between gap-2 -mt-0.5 cursor-pointer text-left"
            >
              <span className="text-[13px] font-semibold text-ink truncate">
                {isLast ? "도착했어요" : `${current + 1}번 ${cur.name}`}
              </span>
              <span className="text-[11px] text-muted shrink-0">
                {Math.min(current + 1, stops.length)} / {stops.length}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}