/** 스팟 이미지가 없을 때 쓰는 공통 기본 이미지(브랜드 톤 그라디언트 + 핀 아이콘). */
export const SPOT_IMAGE_FALLBACK =
  "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='400'%20height='400'%3E%3Cdefs%3E%3ClinearGradient%20id='g'%20x1='0'%20y1='0'%20x2='1'%20y2='1'%3E%3Cstop%20offset='0'%20stop-color='%23D9A88A'/%3E%3Cstop%20offset='1'%20stop-color='%23A8623E'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width='400'%20height='400'%20fill='url(%23g)'/%3E%3Cpath%20d='M200%20140c-33%200-60%2027-60%2060%200%2045%2060%20110%2060%20110s60-65%2060-110c0-33-27-60-60-60zm0%2086a26%2026%200%201%201%200-52%2026%2026%200%200%201%200%2052z'%20fill='%23FFFFFF'%20fill-opacity='0.85'/%3E%3C/svg%3E";

export function withImageFallback(url: string | null | undefined): string {
  return url && url.trim() ? url : SPOT_IMAGE_FALLBACK;
}

export function hasRealImage(url: string | null | undefined): boolean {
  return Boolean(url && url.trim());
}

/** 실제 이미지가 있는 항목을 앞으로, 없는 항목을 뒤로 — 안정 정렬이라 그룹 내 순서는 유지됨 */
export function sortByHasImage<T>(items: T[], hasImage: (item: T) => boolean): T[] {
  return [...items].sort((a, b) => Number(hasImage(b)) - Number(hasImage(a)));
}
