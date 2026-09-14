import { createContext, useContext } from "react";
import type { RouteStop } from "@/lib/route-adapters";

export const CURRENT_ROUTE_ID_KEY = "wavey.route.current-id";

export function loadCurrentRouteId(): number | null {
  try {
    const raw = localStorage.getItem(CURRENT_ROUTE_ID_KEY);
    const id = raw ? Number(raw) : NaN;
    return Number.isFinite(id) ? id : null;
  } catch {
    return null;
  }
}

export interface RouteContextValue {
  routeId: number | null;
  stops: RouteStop[];
  loading: boolean;
  error: string | null;
  /** 마이페이지 등에서 쓰는 루트 스팟 개수 */
  routeIds: string[];
  inRoute: (spotId: string) => boolean;
  toggleRoute: (spotId: string) => void;
  addToRoute: (spotIds: number[]) => Promise<void>;
  removeFromRoute: (routeSpotId: number) => Promise<void>;
  reorderRoute: (orderedRouteSpotIds: number[]) => Promise<void>;
  clearRoute: () => Promise<void>;
}

export const RouteContext = createContext<RouteContextValue | null>(null);

export function useRoute(): RouteContextValue {
  const ctx = useContext(RouteContext);
  if (!ctx) throw new Error("useRoute must be used within <RouteProvider>");
  return ctx;
}
