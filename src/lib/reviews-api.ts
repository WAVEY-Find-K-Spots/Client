import { apiRequest } from "@/lib/auth/api";

export interface SpotReviewItem {
  reviewId: number;
  spotId: number;
  userId: number;
  authorName: string;
  authorImageUrl: string | null;
  countryName: string | null;
  rating: number;
  body: string;
  createdAt: string;
}

export interface SpotReviewList {
  averageRating: number;
  reviewCount: number;
  reviews: SpotReviewItem[];
  page: number;
  size: number;
  hasNext: boolean;
}

/** GET /api/v1/spots/{spotId}/reviews — 비인증 허용 */
export function getSpotReviews(spotId: number, page = 0, size = 20) {
  return apiRequest<SpotReviewList>(
    `/api/v1/spots/${spotId}/reviews?page=${page}&size=${size}`,
  );
}
