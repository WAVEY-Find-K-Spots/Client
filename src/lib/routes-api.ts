import { apiRequest } from "@/lib/auth/api";

export type RouteVisibility = "PUBLIC" | "PRIVATE";
export type SpotCategory = "K_DRAMA" | "K_POP" | "K_HERITAGE" | "K_MOVIE";
export type TransportMode = "WALK" | "TRANSIT" | "CAR";

export interface RouteSummary {
  routeId: number;
  name: string;
  description: string | null;
  visibility: RouteVisibility;
  spotCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface RouteSpotDetail {
  routeSpotId: number;
  spotId: number;
  sequenceOrder: number;
  name: string | null;
  category: SpotCategory | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  thumbnailUrl: string | null;
}

export interface RouteDetail {
  routeId: number;
  userId: number;
  name: string;
  description: string | null;
  visibility: RouteVisibility;
  spotCount: number;
  spots: RouteSpotDetail[];
  createdAt: string;
  updatedAt: string;
}

export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface DirectionsSegment {
  fromRouteSpotId: number;
  toRouteSpotId: number;
  fromSpotId: number;
  toSpotId: number;
  sequenceOrder: number;
  distanceMeters: number;
  durationSeconds: number;
  durationText: string;
  geometry: { type: "LineString"; coordinates: [number, number][] };
}

export interface DirectionsResult {
  routeId: number;
  transportMode: TransportMode;
  total: {
    distanceMeters: number;
    durationSeconds: number;
    distanceText: string;
    durationText: string;
  };
  segments: DirectionsSegment[];
  geometry: { type: "LineString"; coordinates: [number, number][] };
  calculatedAt: string;
}

export interface MyRoutesParams {
  visibility?: RouteVisibility;
  page?: number;
  size?: number;
}

export interface PublicRoutesParams {
  page?: number;
  size?: number;
  regionId?: number;
}

export interface CreateRoutePayload {
  name: string;
  description?: string | null;
  visibility: RouteVisibility;
  spots?: { spotId: number; sequenceOrder: number }[];
}

export interface UpdateRoutePayload {
  name?: string;
  description?: string | null;
  visibility?: RouteVisibility;
}

function withQuery(path: string, params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `${path}?${qs}` : path;
}

/** GET /api/v1/routes — 내 루트 목록 */
export function getMyRoutes(params: MyRoutesParams = {}) {
  return apiRequest<SpringPage<RouteSummary>>(withQuery("/api/v1/routes", params));
}

/** GET /api/v1/routes/public — 인증 불필요 */
export function getPublicRoutes(params: PublicRoutesParams = {}) {
  return apiRequest<SpringPage<RouteSummary>>(withQuery("/api/v1/routes/public", params), {
    authenticated: false,
  });
}

/** GET /api/v1/routes/{routeId} */
export function getRouteDetail(routeId: number) {
  return apiRequest<RouteDetail>(`/api/v1/routes/${routeId}`);
}

/** POST /api/v1/routes */
export function createRoute(payload: CreateRoutePayload) {
  return apiRequest<RouteDetail>("/api/v1/routes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** PATCH /api/v1/routes/{routeId} */
export function updateRoute(routeId: number, payload: UpdateRoutePayload) {
  return apiRequest<RouteDetail>(`/api/v1/routes/${routeId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/** DELETE /api/v1/routes/{routeId} */
export function deleteRoute(routeId: number) {
  return apiRequest<void>(`/api/v1/routes/${routeId}`, { method: "DELETE" });
}

/** POST /api/v1/routes/{routeId}/spots */
export function addRouteSpot(routeId: number, spotId: number, sequenceOrder: number) {
  return apiRequest<{ routeSpotId: number; spotId: number; sequenceOrder: number }>(
    `/api/v1/routes/${routeId}/spots`,
    { method: "POST", body: JSON.stringify({ spotId, sequenceOrder }) },
  );
}

/** PATCH /api/v1/routes/{routeId}/spots/reorder — 전체 스팟을 매번 보내야 함 */
export function reorderRouteSpots(
  routeId: number,
  spots: { routeSpotId: number; sequenceOrder: number }[],
) {
  return apiRequest<{ routeSpotId: number; spotId: number; sequenceOrder: number }[]>(
    `/api/v1/routes/${routeId}/spots/reorder`,
    { method: "PATCH", body: JSON.stringify({ spots }) },
  );
}

/** DELETE /api/v1/routes/{routeId}/spots/{routeSpotId} */
export function removeRouteSpot(routeId: number, routeSpotId: number) {
  return apiRequest<void>(`/api/v1/routes/${routeId}/spots/${routeSpotId}`, {
    method: "DELETE",
  });
}

/** POST /api/v1/routes/{routeId}/directions */
export function getDirections(routeId: number, transportMode: TransportMode) {
  return apiRequest<DirectionsResult>(`/api/v1/routes/${routeId}/directions`, {
    method: "POST",
    body: JSON.stringify({ transportMode }),
  });
}
