import { apiRequest } from "@/lib/auth/api";
import type { SpotSearchParams, SpotSearchResult } from "@/lib/spots-api";

function withQuery(path: string, params: SpotSearchParams = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `${path}?${qs}` : path;
}

/** GET /api/v1/pages/home/spots — 홈 화면 공개 스팟 목록/검색 */
export function getHomeSpots(params: SpotSearchParams = {}) {
  return apiRequest<SpotSearchResult>(
    withQuery("/api/v1/pages/home/spots", params),
    { authenticated: false },
  );
}
