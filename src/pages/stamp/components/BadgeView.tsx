import { useEffect, useState } from "react";
import { Award, Lock, ChevronRight, Gift } from "lucide-react";
import type { BadgeCollection, BadgeItem } from "@/lib/stamps-api";
import { formatAcquiredShort } from "../adapters";
import LoginGateCard from "./LoginGateCard";

interface BadgeViewProps {
  data: BadgeCollection | null;
  loading: boolean;
  error: string | null;
  requireLogin?: boolean;
  onLogin?: () => void;
  onRetry: () => void;
  onClaim?: (badgeId: number) => void;
  claimingBadgeId?: number | null;
}

function BadgeHex({
  name,
  imageUrl,
  fallback,
  locked = false,
}: {
  name: string;
  imageUrl: string | null;
  fallback: string;
  locked?: boolean;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  useEffect(() => setImgFailed(false), [imageUrl]);
  const showImage = imageUrl && !imgFailed;

  return (
    <div
      className="w-16 h-16 shrink-0 overflow-hidden relative"
      style={{
        clipPath:
          "polygon(50% 0%,90% 25%,90% 75%,50% 100%,10% 75%,10% 25%)",
        background: showImage ? undefined : fallback,
      }}
    >
      {showImage && (
        <img
          src={imageUrl}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          onError={() => setImgFailed(true)}
        />
      )}
      {locked && (
        <>
          <span className="absolute inset-0 bg-[#F0EAE4]/80" />
          <span className="absolute inset-0 flex items-center justify-center">
            <Lock size={22} color="#C9BDB6" strokeWidth={1.9} />
          </span>
        </>
      )}
    </div>
  );
}

function EarnedCard({ item }: { item: BadgeItem }) {
  return (
    <button
      type="button"
      className="w-full bg-white rounded-[16px] p-4 shadow-soft flex items-center gap-4 cursor-pointer overflow-hidden"
    >
      <BadgeHex
        name={item.name}
        imageUrl={item.imageUrl}
        fallback="linear-gradient(160deg,#A8623E,#6B3F28)"
      />
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-ink">{item.name}</p>
        {item.description && (
          <p className="mt-1 text-[12px] text-muted">{item.description}</p>
        )}
        <p className="mt-1 text-[11px] text-brand">
          획득
          {formatAcquiredShort(item.acquiredAt)
            ? ` · ${formatAcquiredShort(item.acquiredAt)}`
            : ""}
        </p>
      </div>
      <ChevronRight size={20} color="#DDD4CE" />
    </button>
  );
}

function ClaimableCard({
  item,
  onClaim,
  claiming,
}: {
  item: BadgeItem;
  onClaim?: (badgeId: number) => void;
  claiming?: boolean;
}) {
  return (
    <div className="w-full bg-white rounded-[16px] p-4 shadow-soft flex items-center gap-4 overflow-hidden border border-brand/30">
      <BadgeHex
        name={item.name}
        imageUrl={item.imageUrl}
        fallback="linear-gradient(160deg,#A8623E,#6B3F28)"
      />
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-ink">{item.name}</p>
        {item.description && (
          <p className="mt-1 text-[12px] text-muted">{item.description}</p>
        )}
        <p className="mt-1 text-[11px] text-brand font-medium">
          조건 달성! 지금 수령할 수 있어요
        </p>
      </div>
      <button
        type="button"
        onClick={() => onClaim?.(item.badgeId)}
        disabled={claiming}
        className="flex items-center gap-1 px-3 h-9 rounded-full bg-brand text-white text-[12px] font-semibold cursor-pointer whitespace-nowrap disabled:opacity-60 shrink-0"
      >
        <Gift size={13} />
        {claiming ? "수령 중..." : "수령하기"}
      </button>
    </div>
  );
}

function PendingCard({ item }: { item: BadgeItem }) {
  const percent = item.requiredStamps
    ? Math.min(
        Math.round((item.progress / item.requiredStamps) * 100),
        100,
      )
    : 0;
  return (
    <div className="w-full bg-white rounded-[16px] p-4 shadow-soft flex items-center gap-4 overflow-hidden">
      <BadgeHex
        name={item.name}
        imageUrl={item.imageUrl}
        fallback="#F0EAE4"
        locked
      />
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-muted">{item.name}</p>
        {item.description && (
          <p className="mt-1 text-[12px] text-muted">{item.description}</p>
        )}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-[3px] bg-[#F0EAE4] overflow-hidden">
            <div
              className="h-full rounded-[3px]"
              style={{ width: `${percent}%`, backgroundColor: "#A8623E" }}
            />
          </div>
          <span className="text-[10px] font-medium text-muted shrink-0">
            {item.progress} / {item.requiredStamps}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function BadgeView({
  data,
  loading,
  error,
  requireLogin = false,
  onLogin,
  onRetry,
  onClaim,
  claimingBadgeId,
}: BadgeViewProps) {
  const acquired = data?.acquired ?? [];
  const claimable = data?.claimable ?? [];
  const inProgress = data?.inProgress ?? [];
  const hasEarned = (data?.acquiredCount ?? acquired.length) > 0;

  return (
    <div className="px-5">
      <div className="rounded-[20px] bg-cream p-4 overflow-hidden">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-brand/10">
            <Award size={20} color="#A8623E" strokeWidth={1.8} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-ink">
              {requireLogin
                ? "로그인이 필요한 서비스입니다."
                : hasEarned
                  ? `${data?.acquiredCount ?? acquired.length}개의 특별한 뱃지를 획득했어요`
                  : "스탬프를 모아 특별한 뱃지를 획득하세요"}
            </p>
            <p className="mt-0.5 text-[11px] text-muted leading-snug">
              {requireLogin
                ? "로그인하면 도전 배지와 획득 기록을 확인할 수 있어요"
                : hasEarned
                  ? "더 많은 지역 조건을 채우면 새로운 뱃지가 열려요"
                  : "지역별 조건을 채우면 잠금이 해제돼요"}
            </p>
          </div>
        </div>
        {requireLogin && (
          <button
            type="button"
            onClick={() => onLogin?.()}
            className="mt-3 w-full h-10 rounded-full bg-ink text-white text-[13px] font-semibold cursor-pointer whitespace-nowrap"
          >
            로그인하기
          </button>
        )}
      </div>

      {requireLogin ? (
        <>
          <div className="mt-6 flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-ink">획득한 뱃지</h3>
            <span className="text-[13px] font-medium text-muted">—</span>
          </div>
          <div className="mt-3">
            <LoginGateCard description="로그인하면 획득한 뱃지를 확인할 수 있어요" />
          </div>
          <div className="mt-7 flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-ink">도전 중인 뱃지</h3>
            <span className="text-[13px] font-medium text-muted">—</span>
          </div>
          <div className="mt-3">
            <LoginGateCard description="로그인하면 도전 중인 뱃지를 확인할 수 있어요" />
          </div>
        </>
      ) : (
        <>
          {error && (
            <div className="mt-4 rounded-[16px] bg-white p-4 shadow-soft flex flex-col gap-2">
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
          {loading && !data && !error && (
            <p className="mt-8 text-center text-[13px] text-muted">불러오는 중…</p>
          )}
          {claimable.length > 0 && (
            <>
              <div className="mt-6 flex items-center justify-between">
                <h3 className="text-[15px] font-semibold text-ink">
                  수령 가능한 뱃지
                </h3>
                <span className="text-[13px] font-medium text-brand">
                  {data?.claimableCount ?? claimable.length}개
                </span>
              </div>
              <div className="mt-3 flex flex-col gap-3">
                {claimable.map((b) => (
                  <ClaimableCard
                    key={b.badgeId}
                    item={b}
                    onClaim={onClaim}
                    claiming={claimingBadgeId === b.badgeId}
                  />
                ))}
              </div>
            </>
          )}
          <div className="mt-6 flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-ink">획득한 뱃지</h3>
            <span className="text-[13px] font-medium text-muted">
              {data?.acquiredCount ?? acquired.length}개
            </span>
          </div>
          <div className="mt-3 flex flex-col gap-3">
            {!loading && acquired.length === 0 && !error && (
              <p className="text-[12px] text-muted py-2">
                아직 획득한 뱃지가 없어요
              </p>
            )}
            {acquired.map((b) => (
              <EarnedCard key={b.badgeId} item={b} />
            ))}
          </div>
          <div className="mt-7 flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-ink">도전 중인 뱃지</h3>
            <span className="text-[13px] font-medium text-muted">
              {data?.inProgressCount ?? inProgress.length}개
            </span>
          </div>
          <div className="mt-3 flex flex-col gap-3">
            {!loading && inProgress.length === 0 && !error && (
              <p className="text-[12px] text-muted py-2">
                도전 중인 뱃지가 없어요
              </p>
            )}
            {inProgress.map((b) => (
              <PendingCard key={b.badgeId} item={b} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
