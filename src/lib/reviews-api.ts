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
    { authenticated: false },
  );
}

export interface MyReviewList {
  reviews: SpotReviewItem[];
  page: number;
  size: number;
  hasNext: boolean;
}

/** GET /api/v1/me/reviews — 인증 필요 */
export function getMyReviews(page = 0, size = 20) {
  return apiRequest<MyReviewList>(
    `/api/v1/me/reviews?page=${page}&size=${size}`,
  );
}

export interface ReviewInput {
  rating: number;
  body: string;
}

/** POST /api/v1/spots/{spotId}/reviews — 인증 필요, 스팟당 리뷰 1개(중복 시 409) */
export function createReview(spotId: number, input: ReviewInput) {
  return apiRequest<SpotReviewItem>(`/api/v1/spots/${spotId}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

/** PATCH /api/v1/reviews/{reviewId} — 인증 필요, 본인 리뷰만 */
export function updateReview(reviewId: number, input: Partial<ReviewInput>) {
  return apiRequest<SpotReviewItem>(`/api/v1/reviews/${reviewId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

/** DELETE /api/v1/reviews/{reviewId} — 인증 필요, 본인 리뷰만 */
export function deleteReview(reviewId: number) {
  return apiRequest<void>(`/api/v1/reviews/${reviewId}`, {
    method: "DELETE",
  });
}
