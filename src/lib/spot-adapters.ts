import type { Spot, SpotType, ReviewItem } from "@/mocks/spots";
import type { SpotDetail, SpotNearbyItem, SpotCategory } from "@/lib/spots-api";
import type { SpotReviewItem } from "@/lib/reviews-api";

const categoryToType: Record<SpotCategory, SpotType> = {
  K_DRAMA: "drama",
  K_POP: "kpop",
  K_MOVIE: "movie",
  K_HERITAGE: "tour",
};

const categoryToLabel: Record<SpotCategory, string> = {
  K_DRAMA: "드라마",
  K_POP: "K-POP",
  K_MOVIE: "영화",
  K_HERITAGE: "관광지",
};

/** 백엔드 스팟 상세 응답을 기존 UI가 쓰는 Spot 모양으로 맞춘다.
 *  드라마/음악/영상/태그는 아직 백엔드 콘텐츠 도메인과 연결되지 않아 빈 값으로 둔다. */
export function toDetailSpot(api: SpotDetail): Spot {
  return {
    id: String(api.spotId),
    name: api.name,
    loc: api.address ?? "",
    coord: { lat: api.latitude, lng: api.longitude },
    rating: api.avgRating,
    reviewCount: api.reviewCount,
    type: categoryToType[api.category],
    typeLabel: categoryToLabel[api.category],
    size: "medium",
    image: api.imageUrl ?? "",
    desc: api.description ?? "",
    tags: [],
    info: {
      hours: api.openingHours || "정보 없음",
      hoursNote: api.breakTime || api.closedDays || "",
      address: api.address || "정보 없음",
      transport: api.transportInfo || "정보 없음",
      phone: api.tel || "정보 없음",
    },
    dramas: [],
    sceneTitle: "",
    sceneDesc: "",
    music: [],
    videos: [],
    reviews: [],
  };
}

export interface NearbySpotView {
  id: string;
  name: string;
  loc: string;
  desc: string;
  image: string;
  rating: number;
}

export function toNearbySpotView(n: SpotNearbyItem): NearbySpotView {
  return {
    id: String(n.spotId),
    name: n.name,
    loc: n.address ?? "",
    desc: n.description ?? "",
    image: n.imageUrl ?? "",
    rating: n.avgRating,
  };
}

export function toReviewItem(r: SpotReviewItem): ReviewItem {
  return {
    author: r.authorName,
    flag: r.countryName ?? "",
    date: r.createdAt.slice(0, 10).replace(/-/g, "."),
    rating: Math.round(r.rating),
    text: r.body,
  };
}
