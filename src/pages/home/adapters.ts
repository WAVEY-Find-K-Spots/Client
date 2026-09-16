import type { SpotSearchItem } from "@/lib/spots-api";
import {
  CATEGORY_IMAGE_FALLBACK,
  withImageFallback,
  hasRealImage,
} from "@/lib/image-fallback";
import { categoryLabelByApi } from "@/lib/spot-categories";

export interface HomeSpotView {
  id: string;
  name: string;
  desc: string;
  image: string;
  fallbackImage: string;
  hasImage: boolean;
  rating: number;
  reviewCount: number;
  typeLabel: string;
  distanceKm: number | null;
  saved: boolean;
}

export function toHomeSpotView(item: SpotSearchItem): HomeSpotView {
  return {
    id: String(item.spotId),
    name: item.name,
    desc: item.description ?? "",
    image: withImageFallback(item.imageUrl, item.category),
    fallbackImage: CATEGORY_IMAGE_FALLBACK[item.category],
    hasImage: hasRealImage(item.imageUrl),
    rating: item.avgRating,
    reviewCount: item.reviewCount,
    typeLabel: categoryLabelByApi[item.category],
    distanceKm:
      item.distanceMeters != null ? item.distanceMeters / 1000 : null,
    saved: item.saved,
  };
}
