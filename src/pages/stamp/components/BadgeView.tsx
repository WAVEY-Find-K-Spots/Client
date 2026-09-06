import { useMemo } from "react";
import { earnedBadges, pendingBadges, type BadgeItem } from "@/mocks/stamps";
import {
  Landmark,
  Film,
  Map as MapIcon,
  Lock,
  ChevronRight,
  type LucideIcon,
  Award,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  map: MapIcon,
  landmark: Landmark,
  film: Film,
};

function Hexagon({ gradient }: { gradient?: string }) {
  return (
    <div
      className="w-16 h-16 shrink-0 overflow-hidden"
      style={{
        clipPath:
          "polygon(50% 0%,90% 25%,90% 75%,50% 100%,10% 75%,10% 25%)",
        background: gradient ?? "none",
      }}
    />
  );
}

function EarnedCard({ item }: { item: BadgeItem }) {
  const Icon = iconMap[item.icon] ?? MapIcon;
  return (
    <button
      type="button"
      className="w-full bg-white rounded-[16px] p-4 shadow-soft flex items-center gap-4 cursor-pointer overflow-hidden"
    >
      <div className="w-16 h-16 shrink-0 relative overflow-hidden">
        <Hexagon gradient={item.gradient} />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex items-center justify-center w-7 h-7">
            <Icon size={28} color="#FFFFFF" strokeWidth={1.8} />
          </span>
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-ink">{item.name}</p>
        <p className="mt-1 text-[12px] text-muted">{item.condition}</p>
        <p className="mt-1 text-[11px] text-brand">획득 · {item.date}</p>
      </div>
      <span className="flex items-center justify-center w-5 h-5 shrink-0">
        <ChevronRight size={20} color="#DDD4CE" />
      </span>
    </button>
  );
}

function LockedHex({ gradient }: { gradient?: string }) {
  return (
    <div
      className="w-16 h-16 flex items-center justify-center overflow-hidden"
      style={{
        clipPath:
          "polygon(50% 0%,90% 25%,90% 75%,50% 100%,10% 75%,10% 25%)",
        background: gradient ?? "#F0EAE4",
      }}
    >
      <span className="flex items-center justify-center w-6 h-6">
        <Lock size={22} color="#C9BDB6" strokeWidth={1.9} />
      </span>
    </div>
  );
}

function PendingCard({ item }: { item: BadgeItem }) {
  const percent = item.total
    ? Math.min(Math.round(((item.progress ?? 0) / item.total) * 100), 100)
    : 0;
  return (
    <div className="w-full bg-white rounded-[16px] p-4 shadow-soft flex items-center gap-4 overflow-hidden">
      <LockedHex gradient="#F0EAE4" />
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-muted">{item.name}</p>
        <p className="mt-1 text-[12px] text-muted">{item.condition}</p>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-[3px] bg-[#F0EAE4] overflow-hidden">
            <div
              className="h-full rounded-[3px]"
              style={{ width: `${percent}%`, backgroundColor: "#A8623E" }}
            />
          </div>
          <span className="text-[10px] font-medium text-muted shrink-0">
            {item.progress} / {item.total}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function BadgeView() {
  const hasEarned = earnedBadges.length > 0;

  return (
    <div className="px-5">
      {/* 안내 배너 */}
      <div className="rounded-[20px] bg-cream p-4 flex items-center gap-3 overflow-hidden">
        <span className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-brand/10">
          <span className="flex items-center justify-center w-5 h-5">
            <Award size={20} color="#A8623E" strokeWidth={1.8} />
          </span>
        </span>
        <div className="flex-1">
          <p className="text-[12px] font-semibold text-ink">
            {hasEarned
              ? `${earnedBadges.length}개의 특별한 뱃지를 획득했어요`
              : "스탬프를 모아 특별한 뱃지를 획득하세요"}
          </p>
          <p className="mt-0.5 text-[11px] text-muted leading-snug">
            {hasEarned
              ? "더 많은 지역 조건을 채우면 새로운 뱃지가 열려요"
              : "지역별 조건을 채우면 잠금이 해제돼요"}
          </p>
        </div>
      </div>

      {/* 획득한 뱃지 */}
      <div className="mt-6 flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-ink">획득한 뱃지</h3>
        <span className="text-[13px] font-medium text-muted">
          {earnedBadges.length}개
        </span>
      </div>
      <div className="mt-3 flex flex-col gap-3">
        {earnedBadges.map((b) => (
          <EarnedCard key={b.id} item={b} />
        ))}
      </div>

      {/* 도전 중 뱃지 */}
      <div className="mt-7 flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-ink">도전 중인 뱃지</h3>
        <span className="text-[13px] font-medium text-muted">
          {pendingBadges.length}개
        </span>
      </div>
      <div className="mt-3 flex flex-col gap-3">
        {pendingBadges.map((b) => (
          <PendingCard key={b.id} item={b} />
        ))}
      </div>
    </div>
  );
}