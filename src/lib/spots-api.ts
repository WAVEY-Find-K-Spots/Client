import { apiRequest } from "@/lib/auth/api";
import type { SpotCategory } from "@/lib/routes-api";
export type { SpotCategory } from "@/lib/routes-api";

export type SpotPlaceType =
  | "RESTAURANT"
  | "PLAYGROUND"
  | "CAFE"
  | "STAY"
  | "STATION"
  | "STORE"
  | "CVS"
  | "SHOP"
  | "OTHER";

export type SpotSort = "POPULAR" | "RATING" | "LATEST" | "DISTANCE";

export interface SpotSearchParams {
  keyword?: string;
  regionId?: number;
  category?: SpotCategory;
  placeType?: SpotPlaceType;
  minRating?: number;
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
  sort?: SpotSort;
  page?: number;
  excludeRouteId?: number;
  /** 내가 찜한 스팟만 조회 */
  savedOnly?: boolean;
}

export interface SpotSearchItem {
  spotId: number;
  name: string;
  description: string | null;
  category: SpotCategory;
  imageUrl: string | null;
  avgRating: number;
  reviewCount: number;
  saved: boolean;
  distanceMeters: number | null;
}

export interface SpotSearchResult {
  spots: SpotSearchItem[];
  page: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

/** GET /api/v1/spots — 인증 필요 (docs/#76) */
export function searchSpots(params: SpotSearchParams = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value));
  }
  const qs = search.toString();
  return apiRequest<SpotSearchResult>(`/api/v1/spots${qs ? `?${qs}` : ""}`);
}

export interface SpotDetail {
  spotId: number;
  name: string;
  description: string | null;
  category: SpotCategory;
  imageUrl: string | null;
  avgRating: number;
  reviewCount: number;
  saved: boolean;
  openingHours: string | null;
  breakTime: string | null;
  closedDays: string | null;
  address: string | null;
  transportInfo: string | null;
  tel: string | null;
  latitude: number;
  longitude: number;
}

export interface SpotNearbyItem {
  spotId: number;
  name: string;
  description: string | null;
  address: string | null;
  imageUrl: string | null;
  avgRating: number;
  distanceMeters: number;
}

/** GET /api/v1/spots/{spotId} — 인증 필요 */
export function getSpot(spotId: number) {
  return apiRequest<SpotDetail>(`/api/v1/spots/${spotId}`, {
    authenticated: false,
  });
}

/** GET /api/v1/spots/{spotId}/nearby — 인증 필요, radiusMeters 1~100000 */
export function getNearbySpots(spotId: number, radiusMeters = 5000) {
  return apiRequest<SpotNearbyItem[]>(
    `/api/v1/spots/${spotId}/nearby?radiusMeters=${radiusMeters}`,
    { authenticated: false },
  );
}

export interface SpotSaveResult {
  spotId: number;
  saved: boolean;
  savedCount: number;
}

/** POST /api/v1/spots/{spotId}/save — 인증 필요, 멱등 */
export function saveSpot(spotId: number) {
  return apiRequest<SpotSaveResult>(`/api/v1/spots/${spotId}/save`, {
    method: "POST",
  });
}

/** DELETE /api/v1/spots/{spotId}/save — 인증 필요, 멱등 */
export function unsaveSpot(spotId: number) {
  return apiRequest<SpotSaveResult>(`/api/v1/spots/${spotId}/save`, {
    method: "DELETE",
  });
}
