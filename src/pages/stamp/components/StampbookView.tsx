import { useMemo, useState } from "react";
import { stamps, stampRegions, type StampItem } from "@/mocks/stamps";
import { Award, Check, Lock, CheckCircle } from "lucide-react";

interface StampbookViewProps {
  onOpenStamp: (stamp: StampItem) => void;
}

const collectedCount = stamps.filter((s) => s.earned).length;
const nextGoal = 15;
const earnedRatio = Math.round((collectedCount / nextGoal) * 100);

const stats = [
  { value: String(collectedCount), label: "수집 스탬프" },
  { value: "5", label: "방문 지역" },
  { value: "3", label: "획득 뱃지" },
];

export default function StampbookView({ onOpenStamp }: StampbookViewProps) {
  const [region, setRegion] = useState("all");

  const list = useMemo(() => {
    const base = region === "all" ? [...stamps] : stamps.filter((s) => s.region === region);
    return base.sort((a, b) => Number(b.earned) - Number(a.earned));
  }, [region]);

  const earnedInView = list.filter((s) => s.earned).length;

  return (
    <div className="px-5">
      {/* 여행 진행 요약 카드 */}
      <div className="rounded-[20px] bg-ink p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold text-muted">
            나의 한국 여행
          </span>
          <span className="flex items-center justify-center w-6 h-6">
            <Award size={24} color="#A8623E" strokeWidth={1.8} />
          </span>
        </div>
        <h2 className="mt-2 text-[22px] font-extrabold tracking-tight text-white">
          {collectedCount}개의 스탬프 수집 중
        </h2>

        {/* 진행 바 */}
        <div className="mt-4 h-1.5 rounded-[4px] bg-[#4A2C1A] overflow-hidden">
          <div
            className="h-full rounded-[4px]"
            style={{ width: `${earnedRatio}%`, backgroundColor: "#A8623E" }}
          />
        </div>
        <p className="mt-2 text-[11px] text-muted">
          다음 뱃지까지 {nextGoal - collectedCount}개 남음
        </p>

        {/* 통계 */}
        <div className="mt-4 pt-4 flex items-center border-t border-[#4A2C1A]">
          {stats.map((st, i) => (
            <div
              key={st.label}
              className={`flex-1 flex flex-col items-center ${
                i !== 0 ? "border-l border-[#4A2C1A]" : ""
              }`}
            >
              <span className="text-[20px] font-extrabold text-white leading-none">
                {st.value}
              </span>
              <span className="mt-1 text-[10px] text-muted">{st.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 지역 필터 */}
      <div className="mt-5 -mx-5 overflow-x-auto no-scrollbar px-5">
        <div className="flex items-center gap-2 w-max">
          {stampRegions.map((r) => {
            const isActive = region === r.key;
            return (
              <button
                key={r.key}
                type="button"
                onClick={() => setRegion(r.key)}
                className={`px-4 h-8 rounded-[20px] text-[12px] font-medium cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-ink text-white"
                    : "bg-white text-muted border border-line"
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 섹션 헤더 */}
      <div className="mt-6 flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-ink">수집한 스탬프</h3>
        <span className="text-[13px] font-medium text-muted">
          {earnedInView}개
        </span>
      </div>

      {/* 스탬프 그리드 3열 */}
      <div className="mt-4 grid grid-cols-3 gap-x-2 gap-y-6">
        {list.map((s) =>
          s.earned ? (
            <button
              key={s.id}
              type="button"
              onClick={() => onOpenStamp(s)}
              className="flex flex-col items-center cursor-pointer"
            >
              <div
                className="relative w-[88px] h-[88px] rounded-full p-[6px] bg-cream"
                style={{ border: "2px solid #A8623E" }}
              >
                <div
                  className="w-full h-full rounded-full"
                  style={{ background: s.gradient }}
                />
                <span
                  className="absolute left-1/2 -translate-x-1/2 top-full -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full bg-brand"
                  style={{ boxShadow: "0 4px 10px rgba(168,98,62,0.45)" }}
                >
                  <span className="flex items-center justify-center w-3.5 h-3.5">
                    <Check size={12} color="#FFFFFF" strokeWidth={3} />
                  </span>
                </span>
              </div>
              <p className="mt-3 text-[11px] font-semibold text-ink text-center leading-tight">
                {s.name}
              </p>
              <p className="mt-0.5 text-[9px] text-muted">{s.dateShort}</p>
            </button>
          ) : (
            <div key={s.id} className="flex flex-col items-center">
              <div
                className="w-[88px] h-[88px] rounded-full flex items-center justify-center bg-[#F0EAE4]"
                style={{ border: "2px dashed #DDD4CE" }}
              >
                <span className="flex items-center justify-center w-6 h-6">
                  <Lock size={24} color="#DDD4CE" strokeWidth={1.8} />
                </span>
              </div>
              <p className="mt-3 text-[11px] font-semibold text-muted text-center leading-tight">
                {s.name}
              </p>
              <p className="mt-0.5 text-[9px] text-line">미방문</p>
            </div>
          )
        )}
      </div>

      {/* 안내 배너 */}
      <div className="mt-7 rounded-[16px] bg-cream p-4 flex items-center gap-3">
        <span className="flex items-center justify-center w-9 h-9 shrink-0 rounded-full bg-white">
          <span className="flex items-center justify-center w-5 h-5">
            <CheckCircle size={20} color="#A8623E" strokeWidth={1.8} />
          </span>
        </span>
        <div>
          <p className="text-[12px] font-semibold text-ink">
            스팟을 방문하면 도장이 찍혀요
          </p>
          <p className="mt-0.5 text-[11px] text-muted leading-snug">
            스팟 상세에서 체크인하면 이곳에 스탬프가 생겨요
          </p>
        </div>
      </div>
    </div>
  );
}