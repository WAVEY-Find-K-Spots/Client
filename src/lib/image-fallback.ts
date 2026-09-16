import type { SpotCategory } from "@/lib/routes-api";

interface PlaceholderSpec {
  from: string;
  to: string;
  label: string;
}

const CATEGORY_PLACEHOLDERS: Record<SpotCategory, PlaceholderSpec> = {
  K_DRAMA: { from: "#D9A88A", to: "#7a3d28", label: "드라마" },
  K_POP: { from: "#e2a8c9", to: "#7a2f5e", label: "K-POP" },
  K_MOVIE: { from: "#c9b89a", to: "#5b4936", label: "영화" },
  K_HERITAGE: { from: "#8fd0ac", to: "#2f5e4f", label: "관광지" },
};

const DEFAULT_PLACEHOLDER: PlaceholderSpec = {
  from: "#D9A88A",
  to: "#A8623E",
  label: "WAVEY",
};

const PIN_PATH =
  "M200 150c-33 0-60 27-60 60 0 45 60 110 60 110s60-65 60-110c0-33-27-60-60-60zm0 86a26 26 0 1 1 0-52 26 26 0 0 1 0 52z";

function buildPlaceholder({ from, to, label }: PlaceholderSpec): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${from}"/>
        <stop offset="1" stop-color="${to}"/>
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="url(#g)"/>
    <text x="200" y="150" font-family="sans-serif" font-size="30" font-weight="700" fill="#FFFFFF" fill-opacity="0.9" text-anchor="middle">${label}</text>
    <path d="${PIN_PATH}" fill="#FFFFFF" fill-opacity="0.85"/>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** 카테고리별 기본 이미지(브랜드 톤 그라디언트 + 카테고리 라벨 + 핀 아이콘) */
export const CATEGORY_IMAGE_FALLBACK: Record<SpotCategory, string> = {
  K_DRAMA: buildPlaceholder(CATEGORY_PLACEHOLDERS.K_DRAMA),
  K_POP: buildPlaceholder(CATEGORY_PLACEHOLDERS.K_POP),
  K_MOVIE: buildPlaceholder(CATEGORY_PLACEHOLDERS.K_MOVIE),
  K_HERITAGE: buildPlaceholder(CATEGORY_PLACEHOLDERS.K_HERITAGE),
};

/** 카테고리를 모를 때 쓰는 공통 기본 이미지 */
export const SPOT_IMAGE_FALLBACK = buildPlaceholder(DEFAULT_PLACEHOLDER);

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
