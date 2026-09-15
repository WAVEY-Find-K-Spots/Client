import type { SpotSearchItem } from "@/lib/spots-api";
import type { SpotCategory } from "@/lib/routes-api";

export interface HomeSpotView {
  id: string;
  name: string;
  desc: string;
  image: string;
  rating: number;
  reviewCount: number;
  typeLabel: string;
  size: "tall" | "medium";
  distanceKm: number | null;
  saved: boolean;
}

const categoryToLabel: Record<SpotCategory, string> = {
  K_DRAMA: "드라마",
  K_POP: "K-POP",
  K_MOVIE: "영화",
  K_HERITAGE: "관광지",
};

export function toHomeSpotView(item: SpotSearchItem, index: number): HomeSpotView {
  return {
    id: String(item.spotId),
    name: item.name,
    desc: item.description ?? "",
    image: item.imageUrl ?? "",
    rating: item.avgRating,
    reviewCount: item.reviewCount,
    typeLabel: categoryToLabel[item.category],
    size: index % 3 === 0 ? "tall" : "medium",
    distanceKm:
      item.distanceMeters != null ? item.distanceMeters / 1000 : null,
    saved: item.saved,
  };
}
