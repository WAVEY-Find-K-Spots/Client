import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  RouteContext,
  STORAGE_KEY,
  loadIds,
  type RouteContextValue,
} from "./route-context";

export function RouteProvider({ children }: { children: ReactNode }) {
  const [routeIds, setRouteIds] = useState<string[]>(loadIds);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(routeIds));
    } catch {
      /* storage unavailable — keep in-memory only */
    }
  }, [routeIds]);

  const addToRoute = useCallback((ids: string | string[]) => {
    const list = Array.isArray(ids) ? ids : [ids];
    setRouteIds((prev) => {
      const merged = [...prev];
      list.forEach((id) => {
        if (!merged.includes(id)) merged.push(id);
      });
      return merged;
    });
  }, []);

  const removeFromRoute = useCallback((id: string) => {
    setRouteIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const toggleRoute = useCallback((id: string) => {
    setRouteIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const reorderRoute = useCallback((orderedIds: string[]) => setRouteIds(orderedIds), []);

  const clearRoute = useCallback(() => setRouteIds([]), []);

  const value = useMemo<RouteContextValue>(
    () => ({
      routeIds,
      inRoute: (id: string) => routeIds.includes(id),
      addToRoute,
      removeFromRoute,
      toggleRoute,
      reorderRoute,
      clearRoute,
    }),
    [routeIds, addToRoute, removeFromRoute, toggleRoute, reorderRoute, clearRoute],
  );

  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>;
}
