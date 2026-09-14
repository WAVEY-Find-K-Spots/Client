import { apiRequest } from "@/lib/auth/api";
import type { SpotCategory } from "@/lib/routes-api";

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
