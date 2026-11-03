import { Award, Film, Landmark, Music2, Ticket } from "lucide-react";
import type { SpotCategory } from "@/lib/routes-api";
import { getStampCategoryTheme } from "./stamp-themes";

export default function CategoryThemeIcon({
  category,
  size,
  color,
  strokeWidth,
}: {
  category?: SpotCategory | null;
  size: number;
  color: string;
  strokeWidth?: number;
}) {
  const icon = getStampCategoryTheme(category).icon;
  const Icon =
    icon === "film"
      ? Film
      : icon === "music"
        ? Music2
        : icon === "ticket"
          ? Ticket
          : icon === "landmark"
            ? Landmark
            : Award;
  return <Icon size={size} color={color} strokeWidth={strokeWidth ?? 1.8} />;
}
