import type { SpotCategory } from "@/lib/routes-api";

interface PlaceholderSpec {
  from: string;
  to: string;
  /** (200,200) 기준으로 그려지는 아이콘 마크업 */
  icon: string;
}

const ICON_STROKE =
  'fill="none" stroke="#FFFFFF" stroke-opacity="0.92" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"';
const ICON_FILL = 'fill="#FFFFFF" fill-opacity="0.92"';

// 드라마 — TV 모니터
const ICON_DRAMA = `
  <rect x="-74" y="-58" width="148" height="102" rx="16" ${ICON_STROKE}/>
  <line x1="0" y1="44" x2="0" y2="70" ${ICON_STROKE}/>
  <line x1="-34" y1="70" x2="34" y2="70" ${ICON_STROKE}/>
`;

// K-POP — 음표
const ICON_KPOP = `
  <circle cx="-26" cy="46" r="24" ${ICON_FILL}/>
  <rect x="-4" y="-64" width="12" height="112" rx="6" ${ICON_FILL}/>
  <path d="M8,-64 C50,-50 52,-10 20,6" ${ICON_STROKE}/>
`;

// 영화 — 필름 릴
const ICON_MOVIE = `
  <circle cx="0" cy="0" r="76" ${ICON_STROKE}/>
  <circle cx="0" cy="-40" r="14" ${ICON_FILL}/>
  <circle cx="35" cy="20" r="14" ${ICON_FILL}/>
  <circle cx="-35" cy="20" r="14" ${ICON_FILL}/>
  <circle cx="0" cy="0" r="16" ${ICON_FILL}/>
`;

// 관광지 — 전통 문/랜드마크
const ICON_HERITAGE = `
  <path d="M-92,-14 L0,-74 L92,-14 Z" ${ICON_FILL}/>
  <rect x="-58" y="-14" width="18" height="94" ${ICON_FILL}/>
  <rect x="40" y="-14" width="18" height="94" ${ICON_FILL}/>
  <line x1="-98" y1="82" x2="98" y2="82" ${ICON_STROKE}/>
`;

// 카테고리 미상 — 핀
const ICON_PIN = `
  <path d="M0,-64 C-35,-64 -64,-35 -64,0 C-64,48 0,118 0,118 C0,118 64,48 64,0 C64,-35 35,-64 0,-64 Z M0,28 a28,28 0 1,1 0,-56 a28,28 0 0,1 0,56 Z" ${ICON_FILL}/>
`;

const CATEGORY_PLACEHOLDERS: Record<SpotCategory, PlaceholderSpec> = {
  K_DRAMA: { from: "#D9A88A", to: "#7a3d28", icon: ICON_DRAMA },
  K_POP: { from: "#e2a8c9", to: "#7a2f5e", icon: ICON_KPOP },
  K_MOVIE: { from: "#c9b89a", to: "#5b4936", icon: ICON_MOVIE },
  K_HERITAGE: { from: "#8fd0ac", to: "#2f5e4f", icon: ICON_HERITAGE },
};

const DEFAULT_PLACEHOLDER: PlaceholderSpec = {
  from: "#D9A88A",
  to: "#A8623E",
  icon: ICON_PIN,
};

function buildPlaceholder({ from, to, icon }: PlaceholderSpec): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${from}"/>
        <stop offset="1" stop-color="${to}"/>
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="url(#g)"/>
    <g transform="translate(200,200)">${icon}</g>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** 카테고리별 기본 이미지(브랜드 톤 그라디언트 + 아이콘) */
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
