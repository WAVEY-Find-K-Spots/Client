import { apiRequest } from "@/lib/auth/api";

export type ContentCategory = "ARTIST" | "DRAMA" | "MOVIE";

export interface SpotContentItem {
  contentId: number;
  category: ContentCategory;
  title: string;
}

/** GET /api/v1/spots/{spotId}/contents — 비인증 허용 */
export function getSpotContents(spotId: number, category?: ContentCategory) {
  const qs = category ? `?category=${category}` : "";
  return apiRequest<SpotContentItem[]>(
    `/api/v1/spots/${spotId}/contents${qs}`,
    { authenticated: false },
  );
}
