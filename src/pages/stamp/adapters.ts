import type { BadgeItem, StampItem as ApiStampItem } from "@/lib/stamps-api";

const FALLBACK_GRADIENT =
  "linear-gradient(158deg,#7a3d28,#c96a42)";

/** AcquiredOverlay용 공통 모델 */
export type OverlayStamp = {
  name: string;
  dateShort?: string;
  imageUrl?: string | null;
  gradient?: string;
  kContent?: string;
};

/** ISO LocalDateTime → YYYY.MM.DD */
export function formatAcquiredShort(
  iso: string | null | undefined,
): string | undefined {
  if (!iso) return undefined;
  const datePart = iso.slice(0, 10);
  const [y, m, d] = datePart.split("-");
  if (!y || !m || !d) return undefined;
  return `${y}.${m}.${d}`;
}

export function toOverlayStamp(stamp: ApiStampItem): OverlayStamp {
  return {
    name: stamp.name,
    dateShort: formatAcquiredShort(stamp.acquiredAt),
    imageUrl: stamp.imageUrl,
    gradient: FALLBACK_GRADIENT,
  };
}

export function remainingForNextBadge(inProgress: BadgeItem[]): number | null {
  const next = inProgress[0];
  if (!next) return null;
  return Math.max(0, next.requiredStamps - next.progress);
}

export function nextBadgeProgressPercent(inProgress: BadgeItem[]): number {
  const next = inProgress[0];
  if (!next || next.requiredStamps <= 0) return 0;
  return Math.min(100, Math.round((next.progress / next.requiredStamps) * 100));
}

/** 획득한 스탬프 우선, 그다음 spotId ASC */
export function sortStampBook(stamps: ApiStampItem[]): ApiStampItem[] {
  return [...stamps].sort((a, b) => {
    if (a.acquired !== b.acquired) return a.acquired ? -1 : 1;
    return a.spotId - b.spotId;
  });
}
