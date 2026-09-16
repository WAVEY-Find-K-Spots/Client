import type { SpotCategory } from "@/lib/routes-api";
import type { RouteSpotDetail } from "@/lib/routes-api";
import type { SpotSearchItem } from "@/lib/spots-api";
import { withImageFallback, hasRealImage } from "@/lib/image-fallback";

export type StopType = "drama" | "kpop" | "movie" | "tour";

const CATEGORY_META: Record<SpotCategory, { type: StopType; label: string }> = {
  K_DRAMA: { type: "drama", label: "드라마" },
  K_POP: { type: "kpop", label: "K-POP" },
  K_MOVIE: { type: "movie", label: "영화" },
  K_HERITAGE: { type: "tour", label: "전통·유산" },
};

/** 루트 편집/탐색 화면(RouteMap·PlanSheet·NavOverlay)이 소비하는 스팟 형태. */
export interface RouteStop {
  id: string; // routeSpotId — 삭제·순서변경 시 사용
  spotId: number;
  name: string;
  loc: string;
  coord: { lat: number; lng: number };
  image: string;
  type: StopType;
  typeLabel: string;
  tags: string[];
}

export function toRouteStop(spot: RouteSpotDetail): RouteStop {
  const meta = spot.category ? CATEGORY_META[spot.category] : undefined;
  return {
    id: String(spot.routeSpotId),
    spotId: spot.spotId,
    name: spot.name ?? "삭제된 스팟",
    loc: spot.address ?? "",
    coord: { lat: spot.latitude ?? 0, lng: spot.longitude ?? 0 },
    image: withImageFallback(spot.thumbnailUrl, spot.category),
    type: meta?.type ?? "tour",
    typeLabel: meta?.label ?? "스팟",
    tags: [],
  };
}

/** 스팟 추가 시트 후보 형태. */
export interface SpotCandidate {
  id: string; // spotId
  spotId: number;
  name: string;
  loc: string;
  image: string;
  hasImage: boolean;
  type: StopType;
  typeLabel: string;
}

export function toSpotCandidate(spot: SpotSearchItem): SpotCandidate {
  const meta = CATEGORY_META[spot.category];
  return {
    id: String(spot.spotId),
    spotId: spot.spotId,
    name: spot.name,
    loc: spot.description ?? "",
    image: withImageFallback(spot.imageUrl, spot.category),
    hasImage: hasRealImage(spot.imageUrl),
    type: meta?.type ?? "tour",
    typeLabel: meta?.label ?? "스팟",
  };
}
