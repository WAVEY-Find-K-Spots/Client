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
  routeName: string | null;
  stops: RouteStop[];
  loading: boolean;
  error: string | null;
  /** 마이페이지 등에서 쓰는 루트 스팟 개수 */
  routeIds: string[];
  inRoute: (spotId: string) => boolean;
  toggleRoute: (spotId: string) => void;
  /** 성공하면 true, 실패하면 false를 반환(에러 메시지는 error에 반영됨) */
  addToRoute: (spotIds: number[]) => Promise<boolean>;
  removeFromRoute: (routeSpotId: number) => Promise<boolean>;
  reorderRoute: (orderedRouteSpotIds: number[]) => Promise<boolean>;
  clearRoute: () => Promise<boolean>;
  /** 내 루트 목록에서 다른 루트를 활성 루트로 전환 */
  switchRoute: (routeId: number) => Promise<void>;
  /** 활성 루트 이름 변경 */
  renameRoute: (name: string) => Promise<void>;
  /** 활성 루트가 다른 곳에서(예: 목록 화면) 삭제됐을 때 로컬 상태만 비움 */
  clearRouteReference: () => void;
}

export const RouteContext = createContext<RouteContextValue | null>(null);

export function useRoute(): RouteContextValue {
  const ctx = useContext(RouteContext);
  if (!ctx) throw new Error("useRoute must be used within <RouteProvider>");
  return ctx;
}
