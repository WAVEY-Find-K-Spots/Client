import { apiRequest } from "@/lib/auth/api";

export type ContentCategory = "ARTIST" | "DRAMA" | "MOVIE" | "K_HERITAGE";

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

export type ContentVideoKind = "SHORT" | "LONG";

export interface ContentVideo {
  id: number;
  videoId: string;
  title: string;
  channelTitle: string | null;
  thumbnailUrl: string;
  durationSec: number;
  kind: ContentVideoKind;
  hidden: boolean;
}

export interface ContentTrack {
  id: number;
  contentAlbumId: number | null;
  spotifyTrackId: string;
  title: string;
  artistName: string | null;
  imageUrl: string | null;
  spotifyUrl: string;
  durationMs: number | null;
  hidden: boolean;
}

export interface ContentAlbum {
  id: number;
  spotifyAlbumId: string;
  title: string;
  imageUrl: string | null;
  spotifyUrl: string;
  hidden: boolean;
  tracks: ContentTrack[];
}

export interface SpotMediaContent {
  contentId: number;
  title: string;
  category: ContentCategory;
  videos: ContentVideo[];
  albums: ContentAlbum[];
  tracks: ContentTrack[];
}

export interface SpotMediaResponse {
  spotId: number;
  contents: SpotMediaContent[];
}

/** GET /api/v1/spots/{spotId}/media — 비인증 허용 */
export function getSpotMedia(spotId: number) {
  return apiRequest<SpotMediaResponse>(`/api/v1/spots/${spotId}/media`, {
    authenticated: false,
  });
}
