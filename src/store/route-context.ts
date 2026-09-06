import { createContext, useContext } from "react";

export const STORAGE_KEY = "wavey.route.ids";
export const DEFAULT_IDS = ["gyeongbokgung", "bukchon", "gwanghwamun"];

export function loadIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_IDS;
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((x): x is string => typeof x === "string");
    return DEFAULT_IDS;
  } catch {
    return DEFAULT_IDS;
  }
}

export interface RouteContextValue {
  routeIds: string[];
  inRoute: (id: string) => boolean;
  addToRoute: (ids: string | string[]) => void;
  removeFromRoute: (id: string) => void;
  toggleRoute: (id: string) => void;
  reorderRoute: (orderedIds: string[]) => void;
  clearRoute: () => void;
}

export const RouteContext = createContext<RouteContextValue | null>(null);

export function useRoute(): RouteContextValue {
  const ctx = useContext(RouteContext);
  if (!ctx) throw new Error("useRoute must be used within <RouteProvider>");
  return ctx;
}
