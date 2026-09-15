import { apiRequest } from "@/lib/auth/api";
import type { LatLng } from "@/lib/geo";

export type VisionFeature = "TRANSLATION" | "HERITAGE" | "WEB_SEARCH";

export interface CulturalTerm {
  original: string;
  translatedName: string;
  koreanDescription: string;
  description: string;
  category: string;
  domain: string;
  source: string;
  translationSource: string;
  descriptionSource: string;
  ambiguous: boolean;
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  terms: CulturalTerm[];
}

export interface HeritageResult {
  id: string;
  koreanName: string;
  englishName: string;
  englishNameSource: string;
  address: string;
  detailedAddress: string;
  designationType: string;
  koreanDescription: string;
  englishDescription: string;
  descriptionSource: string;
  translationRequired: boolean;
}

export interface WebPageInfo {
  title: string;
  url: string;
}

export interface WebSearchResult {
  bestGuessLabels: string[];
  webEntities: string[];
  pagesWithImages: WebPageInfo[];
}

export interface VisionAnalysisResult {
  translation: TranslationResult | null;
  heritage: HeritageResult[] | null;
  webSearch: WebSearchResult | null;
}

interface AnalyzeVisionParams {
  file: File;
  features: VisionFeature[];
  location?: LatLng | null;
}

export const visionApi = {
  analyze({ file, features, location }: AnalyzeVisionParams) {
    const query = new URLSearchParams();
    features.forEach((feature) => query.append("features", feature));
    if (location) {
      query.set("lat", String(location.lat));
      query.set("lng", String(location.lng));
    }

    const body = new FormData();
    body.append("file", file);

    return apiRequest<VisionAnalysisResult>(
      `/api/v1/vision/analyze?${query.toString()}`,
      { method: "POST", body },
    );
  },
};
