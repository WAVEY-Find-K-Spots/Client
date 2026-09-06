import { useEffect, useRef, useState, useCallback } from "react";
import type { Spot } from "@/mocks/spots";
import { spotGradientMap } from "@/mocks/spots";
import {
  MapPin,
  Clock,
  Navigation,
  Footprints,
  Train,
  Car,
  GripVertical,
  X,
  Plus,
  ChevronUp,
  ChevronDown,
  ArrowUp,
} from "lucide-react";

export type TransportMode = "walk" | "transit" | "car";

const modeMeta: Record<
  TransportMode,
  { label: string; icon: typeof Footprints; color: string }
> = {
  walk: { label: "도보", icon: Footprints, color: "#2C1810" },
  transit: { label: "대중교통", icon: Train, color: "#2C1810" },
  car: { label: "자동차", icon: Car, color: "#2C1810" },
};

interface PlanSheetProps {
  stops: Spot[];
  transport: TransportMode;
  onTransport: (m: TransportMode) => void;
  onRemove: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
  onAddPick: () => void;
  onStart: () => void;
  travelToNext: (index: number) => string;
}

export default function PlanSheet({
  stops,
  transport,
  onTransport,
  onRemove,
  onReorder,
  onAddPick,
  onStart,
  travelToNext,
}: PlanSheetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const handleRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ startY: 0, moved: false });

  // ----- drag & drop reorder of the stop list -----
  const rowRefs = useRef(new Map<string, HTMLDivElement>());
  const [dragId, setDragId] = useState<string | null>(null);
  const dragPointer = useRef(-1);

  const onGripDown = (id: string) => (e: React.PointerEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragPointer.current = e.pointerId;
    setDragId(id);
  };

  const onGripMove = (e: React.PointerEvent) => {
    if (!dragId) return;
    const from = stops.findIndex((s) => s.id === dragId);
    if (from < 0) return;
    let to = 0;
    stops.forEach((s) => {
      if (s.id === dragId) return;
      const r = rowRefs.current.get(s.id)?.getBoundingClientRect();
      if (r && e.clientY > r.top + r.height / 2) to += 1;
    });
    if (to !== from) {
      const next = stops.map((s) => s.id);
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      onReorder(next);
    }
  };

  const onGripUp = (e: React.PointerEvent) => {
    if (dragPointer.current !== -1) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(dragPointer.current);
      } catch {
        /* pointer already released */
      }
    }
    dragPointer.current = -1;
    setDragId(null);
  };

  const toggle = useCallback(() => setIsExpanded((p) => !p), []);

  useEffect(() => {
    const el = handleRef.current;
    if (!el) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("button") || target.closest("[role='button']")) {
        return;
      }
      dragRef.current = { startY: e.clientY, moved: false };
      el.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      const delta = dragRef.current.startY - e.clientY;
      if (Math.abs(delta) > 4) dragRef.current.moved = true;
    };

    const onPointerUp = (e: PointerEvent) => {
      const delta = dragRef.current.startY - e.clientY;
      if (Math.abs(delta) > 30 && dragRef.current.moved) {
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

  const ModeIcon = modeMeta[transport].icon;

  return (
    <div
      className={`absolute bottom-[82px] left-0 right-0 z-30 bg-white rounded-t-[24px] shadow-soft flex flex-col overflow-hidden transition-all duration-300 ease-out ${isExpanded ? 'h-[540px]' : 'h-[320px]'}`}
    >
      {/* draggable header area: handle + summary + transport tabs */}
      <div
        ref={handleRef}
        className="shrink-0 cursor-grab active:cursor-grabbing select-none"
        style={{ touchAction: 'none' }}
      >
        {/* handle bar */}
        <div className="flex flex-col items-center justify-center pt-3 pb-1">
          <span className="w-10 h-1 rounded-full bg-line" />
          <span className="flex items-center justify-center w-5 h-5 mt-1">
            {isExpanded ? (
              <ChevronDown size={14} color="#A89890" strokeWidth={2.2} />
            ) : (
              <ChevronUp size={14} color="#A89890" strokeWidth={2.2} />
            )}
          </span>
        </div>

        {/* route summary */}
        <div className="px-5 pt-1">
          <div className="flex items-center justify-between bg-cream rounded-2xl px-3 py-3">
            <div className="flex flex-col items-center gap-1 flex-1">
              <span className="flex items-center justify-center w-4 h-4">
                <MapPin size={16} color="#A8623E" strokeWidth={2} />
              </span>
              <span className="text-[12px] font-semibold text-ink leading-none">
                {stops.length}개 스팟
              </span>
            </div>
            <span className="w-px h-8 bg-line" />
            <div className="flex flex-col items-center gap-1 flex-1">
              <span className="flex items-center justify-center w-4 h-4">
                <Clock size={16} color="#A8623E" strokeWidth={2} />
              </span>
              <span className="text-[12px] font-semibold text-ink leading-none">
                약 2시간 30분
              </span>
            </div>
            <span className="w-px h-8 bg-line" />
            <div className="flex flex-col items-center gap-1 flex-1">
              <span className="flex items-center justify-center w-4 h-4">
                <Navigation size={16} color="#A8623E" strokeWidth={2} />
              </span>
              <span className="text-[12px] font-semibold text-ink leading-none">
                12.4km
              </span>
            </div>
          </div>
        </div>

        {/* transport segmented */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center gap-2">
            {(Object.keys(modeMeta) as TransportMode[]).map((m) => {
              const meta = modeMeta[m];
              const Icon = meta.icon;
              const active = transport === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => onTransport(m)}
                  className={`flex-1 h-10 rounded-[20px] flex items-center justify-center gap-1.5 text-[12px] font-medium cursor-pointer whitespace-nowrap ${
                    active
                      ? "bg-ink text-white"
                      : "bg-white text-muted border border-line"
                  }`}
                >
                  <span className="flex items-center justify-center w-4 h-4">
                    <Icon
                      size={15}
                      color={active ? "#FFFFFF" : meta.color}
                      strokeWidth={2}
                    />
                  </span>
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* scrollable spot list (hidden when collapsed) */}
      <div
        className={`flex-1 min-h-0 overflow-hidden mt-3 px-5 transition-[opacity] duration-200 ${
          isExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="h-full overflow-y-auto no-scrollbar pt-1">
          {stops.map((s, i) => {
            const notLast = i < stops.length - 1;
            return (
              <div key={s.id}>
                <div
                  ref={(el) => {
                    if (el) rowRefs.current.set(s.id, el);
                    else rowRefs.current.delete(s.id);
                  }}
                  className={`flex items-center gap-2.5 rounded-[14px] py-2.5 pl-1 pr-1.5 border transition-shadow ${
                    dragId === s.id
                      ? "bg-cream border-brand/40 shadow-soft"
                      : "bg-white border-line/70"
                  }`}
                >
                  {/* drag handle */}
                  <div
                    onPointerDown={onGripDown(s.id)}
                    onPointerMove={onGripMove}
                    onPointerUp={onGripUp}
                    onPointerCancel={onGripUp}
                    role="button"
                    aria-label={`${s.name} 순서 이동`}
                    className="flex items-center justify-center w-6 h-8 shrink-0 cursor-grab active:cursor-grabbing touch-none"
                    style={{ touchAction: "none" }}
                  >
                    <GripVertical size={15} color={dragId === s.id ? "#A8623E" : "#DDD4CE"} />
                  </div>
                  {/* number badge */}
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-ink text-white text-[11px] font-bold shrink-0">
                    {i + 1}
                  </span>
                  {/* thumbnail */}
                  <span
                    className="w-12 h-12 rounded-[10px] shrink-0 overflow-hidden"
                    style={{
                      background: spotGradientMap[s.type] ?? "#A8623E",
                    }}
                  >
                    <img
                      src={s.image}
                      alt={s.name}
                      className="w-full h-full object-cover"
                    />
                  </span>
                  {/* center text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-ink leading-tight">
                      {s.name}
                    </p>
                    <p className="text-[11px] text-muted mt-0.5">
                      {s.typeLabel} · {s.tags[0]}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(s.id)}
                    aria-label={`${s.name} 삭제`}
                    className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-cream cursor-pointer shrink-0"
                  >
                    <X size={16} color="#DDD4CE" />
                  </button>
                </div>

                {notLast && (
                  <div className="flex items-center justify-center py-2.5">
                    <div className="relative w-full flex items-center justify-center">
                      <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-line" />
                      <span className="relative flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-line/70">
                        <span className="flex items-center justify-center w-3 h-3">
                          <ModeIcon
                            size={11}
                            color="#A8623E"
                            strokeWidth={2.2}
                          />
                        </span>
                        <span className="text-[11px] text-sub leading-none">
                          {travelToNext(i)}
                        </span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* add spot button */}
          <button
            type="button"
            onClick={onAddPick}
            className="mt-3 w-full h-[52px] rounded-[14px] border-2 border-dashed border-line flex items-center justify-center gap-1.5 text-[13px] font-medium text-muted cursor-pointer whitespace-nowrap"
          >
            <span className="flex items-center justify-center w-4 h-4">
              <Plus size={16} />
            </span>
            스팟 추가
          </button>
          <div className="h-3" />
        </div>
      </div>

      {/* collapsed hint */}
      {!isExpanded && (
        <div className="flex-1 flex flex-col items-center justify-center px-5 gap-1.5">
          <span className="flex items-center justify-center w-5 h-5">
            <ArrowUp size={16} color="#A89890" strokeWidth={2} />
          </span>
          <span className="text-[12px] font-medium text-muted">
            위로 드래그하여 전체 보기
          </span>
          <span className="text-[11px] text-sub">
            {stops.length}개 스팟이 추가되어 있어요
          </span>
        </div>
      )}

      {/* start route CTA (always visible) */}
      <div className="px-5 pb-4 pt-2 shrink-0">
        <button
          type="button"
          onClick={onStart}
          className="w-full h-[52px] rounded-full bg-ink text-white text-[14px] font-semibold flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <span className="flex items-center justify-center w-5 h-5">
            <Navigation size={17} color="#FFFFFF" strokeWidth={2} />
          </span>
          경로 탐색 시작
        </button>
      </div>
    </div>
  );
}