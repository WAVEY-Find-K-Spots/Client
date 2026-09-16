import { apiRequest } from "@/lib/auth/api";

export interface Region {
  regionId: number;
  nameKo: string;
  nameEn: string;
}

/** GET /api/v1/regions — 인증 필요 */
export function getRegions() {
  return apiRequest<Region[]>("/api/v1/regions", { authenticated: false });
}
