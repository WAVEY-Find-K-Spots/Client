import { useState } from "react";
import type { TransitLeg, TransitOption } from "@/lib/routes-api";
import {
  describeOption,
  displayRouteName,
  formatDistance,
  formatDuration,
  isRailLeg,
  legColor,
  toMinutes,
} from "@/lib/transit-options";
import {
  Bus,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Footprints,
  TrainFront,
  X,
} from "lucide-react";

interface TransitOptionsSheetProps {
  fromName: string;
  toName: string;
  options: TransitOption[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onClose: () => void;
}

function LegIcon({ leg, size, color }: { leg: TransitLeg; size: number; color: string }) {
  if (leg.mode === "WALK") return <Footprints size={size} color={color} />;
  return isRailLeg(leg) ? <TrainFront size={size} color={color} /> : <Bus size={size} color={color} />;
}

function RouteBadge({ leg }: { leg: TransitLeg }) {
  return (
    <span
      className="flex items-center gap-1 px-2 h-5 rounded-full text-[10px] font-semibold text-white leading-none shrink-0"
      style={{ backgroundColor: legColor(leg) }}
    >
      <LegIcon leg={leg} size={10} color="#FFFFFF" />
      {displayRouteName(leg.routeName)}
    </span>
  );
}

/** 세부 구간 소요시간 비율대로 칠한 막대 */
function LegBar({ legs }: { legs: TransitLeg[] }) {
  const total = legs.reduce((sum, leg) => sum + leg.durationSeconds, 0) || 1;
  return (
    <div className="flex h-2 w-full rounded-full overflow-hidden bg-line/60 gap-[2px]">
      {legs.map((leg, i) => (
        <span
          key={i}
          className="h-full"
          style={{
            width: `${(leg.durationSeconds / total) * 100}%`,
            minWidth: 4,
            backgroundColor: legColor(leg),
          }}
        />
      ))}
    </div>
  );
}

function OptionSummary({ option }: { option: TransitOption }) {
  const ridden = option.legs.filter((leg) => leg.mode !== "WALK" && leg.routeName);
  return (
    <>
      <p className="text-[12px] text-sub">{describeOption(option)}</p>
      <div className="mt-2.5">
        <LegBar legs={option.legs} />
      </div>
      {ridden.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1">
          {ridden.map((leg, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={11} color="#A89890" />}
              <RouteBadge leg={leg} />
            </span>
          ))}
        </div>
      )}
    </>
  );
}

function TimelineEndpoint({ label, name }: { label: string; name: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-6 flex justify-center shrink-0">
        <span className="w-3 h-3 rounded-full border-[3px] border-ink bg-white" />
      </span>
      <p className="text-[14px] font-semibold text-ink truncate">
        <span className="text-[12px] font-medium text-muted mr-1.5">{label}</span>
        {name}
      </p>
    </div>
  );
}

function TimelineLeg({ leg, compact = false }: { leg: TransitLeg; compact?: boolean }) {
  const [stopsOpen, setStopsOpen] = useState(false);

  if (leg.mode === "WALK") {
    return (
      <div className="flex gap-3">
        <span className="w-6 flex justify-center shrink-0">
          <span
            className={`w-0 border-l-2 border-dotted border-line ${compact ? "min-h-[28px]" : "min-h-[36px]"}`}
          />
        </span>
        <p className={`flex items-center gap-1.5 text-[12px] text-muted ${compact ? "py-1.5" : "py-2"}`}>
          <Footprints size={13} color="#A89890" />
          도보 {toMinutes(leg.durationSeconds)}분 · {formatDistance(leg.distanceMeters)}
        </p>
      </div>
    );
  }

  const color = legColor(leg);
  const middleStops = (leg.passStops ?? []).slice(1, -1);
  const stationCount = leg.stationCount ?? 0;

  return (
    <div className="flex gap-3">
      <span className="w-6 flex flex-col items-center shrink-0">
        <span
          className="flex items-center justify-center w-6 h-6 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        >
          <LegIcon leg={leg} size={13} color="#FFFFFF" />
        </span>
        <span className="w-1 flex-1 rounded-full" style={{ backgroundColor: color }} />
        <span className="w-2.5 h-2.5 rounded-full border-2 bg-white shrink-0" style={{ borderColor: color }} />
      </span>
      <div className="flex-1 min-w-0 pb-1">
        <div className="flex items-center gap-2 h-6">
          <RouteBadge leg={leg} />
          <p className="text-[13px] font-semibold text-ink truncate">{leg.startName} 승차</p>
        </div>

        <button
          type="button"
          onClick={() => setStopsOpen((open) => !open)}
          disabled={middleStops.length === 0}
          className="mt-1.5 flex items-center gap-1 text-[12px] text-sub cursor-pointer disabled:cursor-default"
        >
          {stationCount > 0 ? `${stationCount}개 ${isRailLeg(leg) ? "역" : "정류장"} 이동` : "이동"}
          {` · ${toMinutes(leg.durationSeconds)}분`}
          {middleStops.length > 0 &&
            (stopsOpen ? (
              <ChevronUp size={13} color="#A89890" />
            ) : (
              <ChevronDown size={13} color="#A89890" />
            ))}
        </button>
        {stopsOpen && (
          <ul className="mt-1.5 flex flex-col gap-1">
            {middleStops.map((name, i) => (
              <li key={`${name}-${i}`} className="text-[11px] text-muted truncate">
                {name}
              </li>
            ))}
          </ul>
        )}

        <p className="mt-2 text-[13px] font-semibold text-ink truncate">{leg.endName} 하차</p>
      </div>
    </div>
  );
}

/**
 * 경로 후보의 세부 구간 타임라인 (도보 → 승차 · N개 정류장 이동 · 하차 → …).
 * fromName/toName을 주면 출발/도착 지점도 함께 그린다.
 */
export function TransitTimeline({
  legs,
  fromName,
  toName,
  compact = false,
}: {
  legs: TransitLeg[];
  fromName?: string;
  toName?: string;
  compact?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      {fromName && <TimelineEndpoint label="출발" name={fromName} />}
      {legs.map((leg, i) => (
        <TimelineLeg key={i} leg={leg} compact={compact} />
      ))}
      {toName && <TimelineEndpoint label="도착" name={toName} />}
    </div>
  );
}

export default function TransitOptionsSheet({
  fromName,
  toName,
  options,
  selectedIndex,
  onSelect,
  onClose,
}: TransitOptionsSheetProps) {
  const [detailIndex, setDetailIndex] = useState<number | null>(null);
  const detail = detailIndex === null ? null : options[detailIndex];

  return (
    <div className="absolute inset-0 z-[60] flex flex-col justify-end">
      <div className="absolute inset-0 bg-ink/45" onClick={onClose} />
      <div className="relative bg-white rounded-t-[26px] flex flex-col max-h-[82%] min-h-0">
        {/* handle + title */}
        <div className="flex flex-col items-center pt-3 pb-3 shrink-0">
          <span className="w-10 h-1 rounded-full bg-line" />
          <div className="w-full flex items-center justify-between gap-2 px-5 mt-3">
            {detail ? (
              <button
                type="button"
                onClick={() => setDetailIndex(null)}
                className="flex items-center gap-1 text-[14px] font-medium text-muted cursor-pointer whitespace-nowrap"
              >
                <ChevronLeft size={18} />
                경로 목록
              </button>
            ) : (
              <h3 className="flex items-center gap-1 min-w-0 text-[16px] font-bold text-ink">
                <span className="truncate">{fromName}</span>
                <ChevronRight size={16} color="#A89890" className="shrink-0" />
                <span className="truncate">{toName}</span>
              </h3>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="flex items-center justify-center w-8 h-8 rounded-full cursor-pointer shrink-0"
            >
              <X size={18} color="#A89890" />
            </button>
          </div>
        </div>

        {detail && detailIndex !== null ? (
          <>
            <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-4">
              <p className="text-[24px] font-extrabold text-ink tracking-tight">
                {formatDuration(detail.durationSeconds)}
                <span className="ml-2 text-[13px] font-medium text-muted">
                  {formatDistance(detail.distanceMeters)}
                </span>
              </p>
              <div className="mt-1">
                <OptionSummary option={detail} />
              </div>

              <div className="mt-5">
                <TransitTimeline legs={detail.legs} fromName={fromName} toName={toName} />
              </div>
            </div>
            <div className="px-5 pt-2 pb-5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  onSelect(detailIndex);
                  onClose();
                }}
                disabled={detailIndex === selectedIndex}
                className="w-full h-[52px] rounded-full bg-ink text-white text-[14px] font-semibold cursor-pointer whitespace-nowrap disabled:bg-cream disabled:text-brand disabled:cursor-default"
              >
                {detailIndex === selectedIndex ? "현재 선택된 경로예요" : "이 경로로 이동하기"}
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-5">
            {options.length === 0 ? (
              <p className="py-10 text-center text-[13px] text-muted">
                이 구간의 대중교통 경로를 찾지 못했어요
              </p>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {options.map((option, i) => {
                  const selected = i === selectedIndex;
                  return (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() => setDetailIndex(i)}
                        className={`w-full text-left rounded-[16px] border px-4 py-3.5 cursor-pointer ${
                          selected ? "border-brand bg-cream/40" : "border-line/70 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[18px] font-extrabold text-ink tracking-tight">
                            {formatDuration(option.durationSeconds)}
                          </p>
                          <span className="flex items-center gap-1.5 shrink-0">
                            {i === 0 && (
                              <span className="px-2 h-5 flex items-center rounded-full bg-cream text-[10px] font-semibold text-brand">
                                추천
                              </span>
                            )}
                            {selected && (
                              <span className="flex items-center gap-0.5 text-[11px] font-semibold text-brand">
                                <Check size={13} strokeWidth={2.6} />
                                선택됨
                              </span>
                            )}
                            <ChevronRight size={16} color="#A89890" />
                          </span>
                        </div>
                        <div className="mt-1">
                          <OptionSummary option={option} />
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
