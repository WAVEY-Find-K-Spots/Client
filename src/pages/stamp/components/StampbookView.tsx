import { Award, Check, Lock, CheckCircle } from "lucide-react";
import type { StampItem } from "@/lib/stamps-api";
import { formatAcquiredShort } from "../adapters";
import LoginGateCard from "./LoginGateCard";
import StampAvatar from "./StampAvatar";

export interface RegionChip {
  key: string;
  label: string;
  regionId: number | null;
}

interface StampbookViewProps {
  stamps: StampItem[];
  collectedCount: number;
  badgeAcquiredCount: number;
  progressPercent: number;
  nextBadgeRemaining: number | null;
  regionKey: string;
  regionChips: RegionChip[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasNext: boolean;
  requireLogin?: boolean;
  onLogin?: () => void;
  onRegionChange: (key: string, regionId: number | null) => void;
  onRetry: () => void;
  onLoadMore: () => void;
  onOpenStamp: (stamp: StampItem) => void;
}

export default function StampbookView({
  stamps,
  collectedCount,
  badgeAcquiredCount,
  progressPercent,
  nextBadgeRemaining,
  regionKey,
  regionChips,
  loading,
  loadingMore,
  error,
  hasNext,
  requireLogin = false,
  onLogin,
  onRegionChange,
  onRetry,
  onLoadMore,
  onOpenStamp,
}: StampbookViewProps) {
  const regionCount = new Set(
    stamps.filter((s) => s.acquired && s.regionId != null).map((s) => s.regionId),
  ).size;
  const earnedInView = stamps.filter((s) => s.acquired).length;

  const stats = requireLogin
    ? [
        { value: "—", label: "수집 스탬프" },
        { value: "—", label: "방문 지역" },
        { value: "—", label: "획득 뱃지" },
      ]
    : [
        { value: String(collectedCount), label: "수집 스탬프" },
        { value: String(regionCount), label: "방문 지역" },
        { value: String(badgeAcquiredCount), label: "획득 뱃지" },
      ];

  return (
    <div className="px-5">
      <div className="rounded-[20px] bg-ink p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold text-muted">
            나의 한국 여행
          </span>
          <span className="flex items-center justify-center w-6 h-6">
            <Award size={24} color="#A8623E" strokeWidth={1.8} />
          </span>
        </div>

        {requireLogin ? (
          <div className="mt-3">
            <LoginGateCard
              variant="dark"
              showCta
              description="로그인하면 방문 기록이 스탬프북에 쌓여요"
              onLogin={() => onLogin?.()}
            />
          </div>
        ) : (
          <>
            <h2 className="mt-2 text-[22px] font-extrabold tracking-tight text-white">
              {collectedCount}개의 스탬프 수집 중
            </h2>
            <div className="mt-4 h-1.5 rounded-[4px] bg-[#4A2C1A] overflow-hidden">
              <div
                className="h-full rounded-[4px]"
                style={{
                  width: `${Math.min(100, Math.max(0, progressPercent))}%`,
                  backgroundColor: "#A8623E",
                }}
              />
            </div>
            <p className="mt-2 text-[11px] text-muted">
              {nextBadgeRemaining != null
                ? `다음 뱃지까지 ${nextBadgeRemaining}개 남음`
                : "스팟을 방문해 스탬프를 모아보세요"}
            </p>
          </>
        )}

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

      <div className="mt-5 -mx-5 overflow-x-auto no-scrollbar px-5">
        <div className="flex items-center gap-2 w-max">
          {regionChips.map((r) => {
            const isActive = regionKey === r.key;
            return (
              <button
                key={r.key}
                type="button"
                onClick={() => onRegionChange(r.key, r.regionId)}
                disabled={requireLogin}
                className={`px-4 h-8 rounded-[20px] text-[12px] font-medium cursor-pointer whitespace-nowrap disabled:opacity-60 ${
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

      <div className="mt-6 flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-ink">수집한 스탬프</h3>
        <span className="text-[13px] font-medium text-muted">
          {requireLogin ? "—" : `${earnedInView}개`}
        </span>
      </div>

      {requireLogin ? (
        <div className="mt-4">
          <LoginGateCard description="로그인하면 방문 스탬프가 여기에 쌓여요" />
        </div>
      ) : (
        <>
          {error && (
            <div className="mt-4 rounded-[16px] bg-cream p-4 flex flex-col gap-2">
              <p className="text-[12px] text-ink">{error}</p>
              <button
                type="button"
                onClick={onRetry}
                className="self-start text-[12px] font-semibold text-brand cursor-pointer"
              >
                다시 시도
              </button>
            </div>
          )}

          {loading && stamps.length === 0 && !error && (
            <p className="mt-8 text-center text-[13px] text-muted">불러오는 중…</p>
          )}

          {!loading && !error && stamps.length === 0 && (
            <p className="mt-8 text-center text-[13px] text-muted">
              이 지역에 스탬프 후보가 없어요
            </p>
          )}

          <div className="mt-4 grid grid-cols-3 gap-x-2 gap-y-6">
            {stamps.map((s) =>
              s.acquired && s.stampId != null ? (
                <button
                  key={`spot-${s.spotId}`}
                  type="button"
                  onClick={() => onOpenStamp(s)}
                  className="flex flex-col items-center cursor-pointer"
                >
                  <div
                    className="relative w-[88px] h-[88px] rounded-full p-[6px] bg-cream"
                    style={{ border: "2px solid #A8623E" }}
                  >
                    <StampAvatar
                      name={s.name}
                      imageUrl={s.imageUrl}
                      size={72}
                    />
                    <span
                      className="absolute left-1/2 -translate-x-1/2 top-full -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full bg-brand"
                      style={{ boxShadow: "0 4px 10px rgba(168,98,62,0.45)" }}
                    >
                      <Check size={12} color="#FFFFFF" strokeWidth={3} />
                    </span>
                  </div>
                  <p className="mt-3 text-[11px] font-semibold text-ink text-center leading-tight">
                    {s.name}
                  </p>
                  <p className="mt-0.5 text-[9px] text-muted">
                    {formatAcquiredShort(s.acquiredAt) ?? "획득"}
                  </p>
                </button>
              ) : (
                <div
                  key={`spot-${s.spotId}`}
                  className="flex flex-col items-center"
                >
                  <div
                    className="w-[88px] h-[88px] rounded-full flex items-center justify-center bg-[#F0EAE4]"
                    style={{ border: "2px dashed #DDD4CE" }}
                  >
                    <Lock size={24} color="#DDD4CE" strokeWidth={1.8} />
                  </div>
                  <p className="mt-3 text-[11px] font-semibold text-muted text-center leading-tight">
                    {s.name}
                  </p>
                  <p className="mt-0.5 text-[9px] text-line">미방문</p>
                </div>
              ),
            )}
          </div>

          {hasNext && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                disabled={loadingMore}
                onClick={onLoadMore}
                className="px-5 h-9 rounded-full bg-white border border-line text-[12px] font-medium text-muted cursor-pointer disabled:opacity-60"
              >
                {loadingMore ? "불러오는 중…" : "더 보기"}
              </button>
            </div>
          )}
        </>
      )}

      <div className="mt-7 rounded-[16px] bg-cream p-4 flex items-center gap-3">
        <span className="flex items-center justify-center w-9 h-9 shrink-0 rounded-full bg-white">
          <CheckCircle size={20} color="#A8623E" strokeWidth={1.8} />
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
