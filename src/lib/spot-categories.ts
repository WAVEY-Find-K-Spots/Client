import type { SpotCategory } from "@/lib/routes-api";

export type HomeCategoryKey = "all" | "drama" | "movie" | "heritage" | "celebrity";

export interface HomeCategory {
  key: HomeCategoryKey;
  label: string;
  apiCategory?: SpotCategory;
}

export const homeCategories: HomeCategory[] = [
  { key: "all", label: "전체" },
  { key: "drama", label: "드라마", apiCategory: "K_DRAMA" },
  { key: "movie", label: "영화", apiCategory: "K_MOVIE" },
  { key: "heritage", label: "문화재", apiCategory: "K_HERITAGE" },
  { key: "celebrity", label: "연예인", apiCategory: "K_POP" },
];

export const categoryLabelByApi: Record<SpotCategory, string> = {
  K_DRAMA: "드라마",
  K_POP: "연예인",
  K_MOVIE: "영화",
  K_HERITAGE: "문화재",
};

export function categoryToApi(key: HomeCategoryKey): SpotCategory | undefined {
  return homeCategories.find((category) => category.key === key)?.apiCategory;
}

export function categoryLabel(key: HomeCategoryKey): string {
  return homeCategories.find((category) => category.key === key)?.label ?? "전체";
}
