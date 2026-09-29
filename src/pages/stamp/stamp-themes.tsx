import type { SpotCategory } from "@/lib/routes-api";

export type StampVisualState = "locked" | "acquired";
export type BadgeVisualState = "locked" | "claimable" | "acquired";
export type StampThemeIcon = "film" | "music" | "ticket" | "landmark" | "award";

export interface StampCategoryTheme {
  accent: string;
  background: string;
  border: string;
  fallback: string;
  icon: StampThemeIcon;
  emoji: string;
}

const DEFAULT_THEME: StampCategoryTheme = {
  accent: "#A8623E",
  background: "#F4E7DE",
  border: "#A8623E",
  fallback: "linear-gradient(158deg,#7a3d28,#c96a42)",
  icon: "award",
  emoji: "🏆",
};

export const STAMP_CATEGORY_THEMES: Record<SpotCategory, StampCategoryTheme> = {
  K_DRAMA: { accent: "#A33F58", background: "#F7E4E8", border: "#A33F58", fallback: "linear-gradient(158deg,#7E2944,#D97878)", icon: "film", emoji: "🎬" },
  K_POP: { accent: "#7656C7", background: "#ECE7FA", border: "#7656C7", fallback: "linear-gradient(158deg,#48318A,#61B9D8)", icon: "music", emoji: "🎵" },
  K_MOVIE: { accent: "#2F527F", background: "#E5EDF7", border: "#C49A45", fallback: "linear-gradient(158deg,#1D3457,#C49A45)", icon: "ticket", emoji: "🎞️" },
  K_HERITAGE: { accent: "#A8623E", background: "#F1E7D7", border: "#477A68", fallback: "linear-gradient(158deg,#A8623E,#477A68)", icon: "landmark", emoji: "🏛️" },
};

export function getStampCategoryTheme(category?: SpotCategory | null) {
  return (category && STAMP_CATEGORY_THEMES[category]) || DEFAULT_THEME;
}
