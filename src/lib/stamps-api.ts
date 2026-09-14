import { apiRequest } from "@/lib/auth/api";

export type StampLanguage = "ko" | "en";

export type StampItem = {
  stampId: number | null;
  spotId: number;
  regionId: number | null;
  name: string;
  imageUrl: string | null;
  acquired: boolean;
  acquiredAt: string | null;
};

export type BadgeItem = {
  badgeId: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  requiredStamps: number;
  progress: number;
  acquiredAt: string | null;
};

export type BadgeCollection = {
  acquiredCount: number;
  inProgressCount: number;
  acquired: BadgeItem[];
  inProgress: BadgeItem[];
};

export type StampBook = {
  collectedCount: number;
  stamps: StampItem[];
  page: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
};

export type StampClaim = {
  stamp: StampItem;
  newlyAcquired: boolean;
  badges: BadgeCollection;
};

export type StampBookParams = {
  regionId?: number;
  language?: StampLanguage;
  page?: number;
  size?: number;
};

function languageQs(language: StampLanguage = "ko") {
  return `language=${language}`;
}

/** GET /api/v1/me/stamps */
export function getMyStamps(params: StampBookParams = {}) {
  const search = new URLSearchParams();
  search.set("language", params.language ?? "ko");
  if (params.regionId !== undefined) search.set("regionId", String(params.regionId));
  if (params.page !== undefined) search.set("page", String(params.page));
  if (params.size !== undefined) search.set("size", String(params.size));
  return apiRequest<StampBook>(`/api/v1/me/stamps?${search.toString()}`);
}

/** GET /api/v1/me/stamps/{stampId} — 획득·생성된 stampId만 */
export function getStampDetail(stampId: number, language: StampLanguage = "ko") {
  return apiRequest<StampItem>(
    `/api/v1/me/stamps/${stampId}?${languageQs(language)}`,
  );
}

/** POST /api/v1/spots/{spotId}/stamp */
export function claimStamp(
  spotId: number,
  body: { latitude: number; longitude: number },
  language: StampLanguage = "ko",
) {
  return apiRequest<StampClaim>(
    `/api/v1/spots/${spotId}/stamp?${languageQs(language)}`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

/** GET /api/v1/me/badges */
export function getMyBadges(language: StampLanguage = "ko") {
  return apiRequest<BadgeCollection>(
    `/api/v1/me/badges?${languageQs(language)}`,
  );
}
