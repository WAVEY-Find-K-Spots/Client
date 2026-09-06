import type { ReactNode } from "react";

export interface SpotFilterState {
  region: string;
  type: string;
  minRating: number;
  distance: number;
}

const regionOptions = ["서울", "부산", "경주", "제주", "강릉", "전주"];

const typeOptions: { key: string; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "drama", label: "K-Drama" },
  { key: "kpop", label: "K-POP" },
  { key: "movie", label: "K-Movie" },
  { key: "tour", label: "관광지" },
];

const ratingOptions: { value: number; label: string }[] = [
  { value: 0, label: "전체" },
  { value: 3, label: "3.0 이상" },
  { value: 4, label: "4.0 이상" },
  { value: 4.5, label: "4.5 이상" },
];

const distanceOptions: { value: number; label: string }[] = [
  { value: 0, label: "전체" },
  { value: 1, label: "1km 이내" },
  { value: 3, label: "3km 이내" },
  { value: 5, label: "5km 이내" },
];

interface FilterSheetProps {
  filters: SpotFilterState;
  onChange: (partial: Partial<SpotFilterState>) => void;
  onReset: () => void;
  onApply: () => void;
}

function Pill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 h-8 rounded-full text-[13px] font-medium cursor-pointer whitespace-nowrap ${
        active
          ? "bg-ink text-white"
          : "bg-white text-muted border border-line"
      }`}
    >
      {children}
    </button>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="text-[13px] font-semibold text-muted">{title}</p>
      <div className="mt-2.5 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export default function FilterSheet({
  filters,
  onChange,
  onReset,
  onApply,
}: FilterSheetProps) {
  return (
    <div
      className="w-full bg-white rounded-t-[24px] flex flex-col overflow-hidden"
      style={{ maxHeight: "86%" }}
    >
      {/* handle */}
      <div className="flex justify-center pt-2.5 pb-1 shrink-0">
        <div className="w-9 h-1 rounded-full bg-[#DDD4CE]" />
      </div>

      {/* header */}
      <div className="flex items-center justify-between px-5 pt-2 pb-4 shrink-0">
        <h3 className="text-[18px] font-semibold text-ink">상세 필터</h3>
        <button
          type="button"
          onClick={onReset}
          className="text-[14px] text-muted cursor-pointer whitespace-nowrap"
        >
          초기화
        </button>
      </div>

      {/* scrollable sections */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-6 flex flex-col gap-6 no-scrollbar">
        <Section title="지역">
          {regionOptions.map((r) => (
            <Pill
              key={r}
              active={filters.region === r}
              onClick={() => onChange({ region: r })}
            >
              {r}
            </Pill>
          ))}
        </Section>

        <Section title="콘텐츠 유형">
          {typeOptions.map((t) => (
            <Pill
              key={t.key}
              active={filters.type === t.key}
              onClick={() => onChange({ type: t.key })}
            >
              {t.label}
            </Pill>
          ))}
        </Section>

        <Section title="최소 평점">
          {ratingOptions.map((r) => (
            <Pill
              key={r.value}
              active={filters.minRating === r.value}
              onClick={() => onChange({ minRating: r.value })}
            >
              {r.label}
            </Pill>
          ))}
        </Section>

        <Section title="거리">
          {distanceOptions.map((d) => (
            <Pill
              key={d.value}
              active={filters.distance === d.value}
              onClick={() => onChange({ distance: d.value })}
            >
              {d.label}
            </Pill>
          ))}
        </Section>
      </div>

      {/* apply */}
      <div className="px-5 pb-5 pt-2 shrink-0">
        <button
          type="button"
          onClick={onApply}
          className="w-full h-[52px] rounded-full bg-ink text-white text-[15px] font-semibold cursor-pointer whitespace-nowrap shadow-soft"
        >
          필터 적용하기
        </button>
      </div>
    </div>
  );
}