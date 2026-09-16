import type { SpotCategory } from "@/lib/routes-api";
import fallbackCelebrity from "@/assets/fallback-celebrity.png";
import fallbackDrama from "@/assets/fallback-drama.png";
import fallbackHeritage from "@/assets/fallback-heritage.png";
import fallbackMovie from "@/assets/fallback-movie.png";

/** 카테고리별 기본 이미지(브랜드 톤 그라디언트 + 카테고리 라벨 + 핀 아이콘) */
export const CATEGORY_IMAGE_FALLBACK: Record<SpotCategory, string> = {
  K_DRAMA: fallbackDrama,
  K_POP: fallbackCelebrity,
  K_MOVIE: fallbackMovie,
  K_HERITAGE: fallbackHeritage,
};

/** 카테고리를 모를 때 쓰는 공통 기본 이미지 */
export const SPOT_IMAGE_FALLBACK = fallbackHeritage;

export function withImageFallback(
  url: string | null | undefined,
  category?: SpotCategory | null,
): string {
  if (url && url.trim()) return url;
  return category ? CATEGORY_IMAGE_FALLBACK[category] : SPOT_IMAGE_FALLBACK;
}

export function hasRealImage(url: string | null | undefined): boolean {
  return Boolean(url && url.trim());
}

/** 실제 이미지가 있는 항목을 앞으로, 없는 항목을 뒤로 — 안정 정렬이라 그룹 내 순서는 유지됨 */
export function sortByHasImage<T>(items: T[], hasImage: (item: T) => boolean): T[] {
  return [...items].sort((a, b) => Number(hasImage(b)) - Number(hasImage(a)));
}
