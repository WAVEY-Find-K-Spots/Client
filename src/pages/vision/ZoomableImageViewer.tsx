import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from "react";
import { createPortal } from "react-dom";
import { Minus, Plus, X } from "lucide-react";

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const DOUBLE_TAP_SCALE = 2.5;
const DOUBLE_TAP_MS = 280;

interface ViewerImage {
  key: string;
  label: string;
  src: string;
  alt: string;
}

interface ZoomableImageViewerProps {
  images: ViewerImage[];
  initialKey: string;
  onClose: () => void;
}

interface Transform {
  scale: number;
  x: number;
  y: number;
}

const IDENTITY: Transform = { scale: 1, x: 0, y: 0 };

function clampScale(scale: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

/** 확대한 이미지가 화면 밖으로 너무 멀리 끌려가지 않도록 이동 범위를 제한한다 */
function clampOffset(t: Transform, stage: HTMLElement | null): Transform {
  if (!stage || t.scale <= 1) return IDENTITY;
  const maxX = (stage.clientWidth * (t.scale - 1)) / 2;
  const maxY = (stage.clientHeight * (t.scale - 1)) / 2;
  return {
    scale: t.scale,
    x: Math.min(maxX, Math.max(-maxX, t.x)),
    y: Math.min(maxY, Math.max(-maxY, t.y)),
  };
}

/** 화면의 한 점(focus)을 기준으로 확대·축소한다. focus는 무대 중심 기준 좌표 */
function zoomAround(t: Transform, nextScale: number, focusX: number, focusY: number): Transform {
  const scale = clampScale(nextScale);
  const ratio = scale / t.scale;
  return {
    scale,
    x: focusX - (focusX - t.x) * ratio,
    y: focusY - (focusY - t.y) * ratio,
  };
}

export default function ZoomableImageViewer({
  images,
  initialKey,
  onClose,
}: ZoomableImageViewerProps) {
  const [activeKey, setActiveKey] = useState(initialKey);
  const [transform, setTransform] = useState<Transform>(IDENTITY);
  const stageRef = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ distance: number; transform: Transform; midX: number; midY: number } | null>(null);
  const lastTap = useRef(0);

  const active = images.find((image) => image.key === activeKey) ?? images[0];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const scroll = document.getElementById("app-scroll");
    const prevOverflow = scroll?.style.overflow ?? "";
    if (scroll) scroll.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      if (scroll) scroll.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const toStagePoint = (clientX: number, clientY: number) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: clientX - rect.left - rect.width / 2,
      y: clientY - rect.top - rect.height / 2,
    };
  };

  const apply = (next: Transform) => setTransform(clampOffset(next, stageRef.current));

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const mid = toStagePoint((a.x + b.x) / 2, (a.y + b.y) / 2);
      gesture.current = {
        distance: Math.hypot(a.x - b.x, a.y - b.y),
        transform,
        midX: mid.x,
        midY: mid.y,
      };
      return;
    }

    const now = Date.now();
    if (now - lastTap.current < DOUBLE_TAP_MS) {
      lastTap.current = 0;
      const point = toStagePoint(e.clientX, e.clientY);
      apply(transform.scale > 1 ? IDENTITY : zoomAround(transform, DOUBLE_TAP_SCALE, point.x, point.y));
      return;
    }
    lastTap.current = now;
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const previous = pointers.current.get(e.pointerId);
    if (!previous) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size >= 2 && gesture.current) {
      const [a, b] = [...pointers.current.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      const start = gesture.current;
      if (start.distance > 0) {
        apply(zoomAround(start.transform, start.transform.scale * (distance / start.distance), start.midX, start.midY));
      }
      return;
    }

    if (transform.scale > 1) {
      apply({
        scale: transform.scale,
        x: transform.x + (e.clientX - previous.x),
        y: transform.y + (e.clientY - previous.y),
      });
    }
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) gesture.current = null;
  };

  const onWheel = (e: ReactWheelEvent<HTMLDivElement>) => {
    const point = toStagePoint(e.clientX, e.clientY);
    apply(zoomAround(transform, transform.scale * (e.deltaY < 0 ? 1.15 : 1 / 1.15), point.x, point.y));
  };

  const stepZoom = (factor: number) => apply(zoomAround(transform, transform.scale * factor, 0, 0));

  const switchImage = (key: string) => {
    setActiveKey(key);
    setTransform(IDENTITY);
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="이미지 크게 보기"
      className="absolute inset-0 z-[90] flex flex-col bg-ink/95"
    >
      <div className="flex shrink-0 items-center justify-between px-4 pt-[calc(env(safe-area-inset-top,0px)+14px)] pb-3">
        <p className="text-[12px] font-semibold text-white">{active.label}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white"
        >
          <X size={18} />
        </button>
      </div>

      <div
        ref={stageRef}
        className="relative min-h-0 flex-1 touch-none select-none overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        <img
          src={active.src}
          alt={active.alt}
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full object-contain"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transition: pointers.current.size ? "none" : "transform 120ms ease-out",
          }}
        />
      </div>

      <div className="shrink-0 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+18px)]">
        <div className="flex items-center gap-2">
          {images.length > 1 && (
            <div className="flex flex-1 rounded-[13px] bg-white/10 p-1">
              {images.map((image) => (
                <button
                  key={image.key}
                  type="button"
                  aria-pressed={image.key === active.key}
                  onClick={() => switchImage(image.key)}
                  className={`h-8 flex-1 rounded-[10px] text-[10.5px] font-semibold transition-colors ${
                    image.key === active.key ? "bg-white text-ink" : "text-white/70"
                  }`}
                >
                  {image.label}
                </button>
              ))}
            </div>
          )}
          <div className="ml-auto flex items-center gap-1 rounded-[13px] bg-white/10 p-1">
            <button
              type="button"
              aria-label="축소"
              disabled={transform.scale <= MIN_SCALE}
              onClick={() => stepZoom(1 / 1.5)}
              className="flex h-8 w-8 items-center justify-center rounded-[10px] text-white disabled:opacity-40"
            >
              <Minus size={15} />
            </button>
            <span className="w-10 text-center text-[10.5px] font-semibold text-white">
              {Math.round(transform.scale * 100)}%
            </span>
            <button
              type="button"
              aria-label="확대"
              disabled={transform.scale >= MAX_SCALE}
              onClick={() => stepZoom(1.5)}
              className="flex h-8 w-8 items-center justify-center rounded-[10px] text-white disabled:opacity-40"
            >
              <Plus size={15} />
            </button>
          </div>
        </div>
        <p className="mt-2 text-center text-[9.5px] text-white/60">
          두 손가락으로 벌리거나 두 번 탭하면 확대돼요
        </p>
      </div>
    </div>,
    document.getElementById("phone-frame") ?? document.body,
  );
}
