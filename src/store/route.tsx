import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  addRouteSpot,
  createRoute,
  deleteRoute,
  getMyRoutes,
  getRouteDetail,
  removeRouteSpot,
  reorderRouteSpots,
  updateRoute,
  type RouteVisibility,
} from "@/lib/routes-api";
import { toRouteStop, type RouteStop } from "@/lib/route-adapters";
import {
  CURRENT_ROUTE_ID_KEY,
  RouteContext,
  loadCurrentRouteId,
  type RouteContextValue,
} from "./route-context";

export function RouteProvider({ children }: { children: ReactNode }) {
  const [routeId, setRouteId] = useState<number | null>(null);
  const [routeName, setRouteName] = useState<string | null>(null);
  const [routeVisibility, setRouteVisibility] = useState<RouteVisibility | null>(null);
  // 서버 PATCH가 요청에 없는 필드를 null로 덮어쓰는 버그(Server #140)가 있어,
  // 이름/공개여부를 바꿀 때도 항상 현재 description을 함께 보내 유실을 막는다
  const [routeDescription, setRouteDescription] = useState<string | null>(null);
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const persistRouteId = (id: number | null) => {
    setRouteId(id);
    try {
      if (id === null) localStorage.removeItem(CURRENT_ROUTE_ID_KEY);
      else localStorage.setItem(CURRENT_ROUTE_ID_KEY, String(id));
    } catch {
      /* storage unavailable — keep in-memory only */
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      setError(null);
      try {
        const savedId = loadCurrentRouteId();
        if (savedId !== null) {
          const detail = await getRouteDetail(savedId);
          if (cancelled) return;
          setRouteId(savedId);
          setRouteName(detail.name);
          setRouteVisibility(detail.visibility);
          setRouteDescription(detail.description);
          setStops(detail.spots.map(toRouteStop));
          return;
        }

        const page = await getMyRoutes({ page: 0, size: 1 });
        if (cancelled) return;
        const existing = page.content[0];
        if (existing) {
          const detail = await getRouteDetail(existing.routeId);
          if (cancelled) return;
          persistRouteId(existing.routeId);
          setRouteName(detail.name);
          setRouteVisibility(detail.visibility);
          setRouteDescription(detail.description);
          setStops(detail.spots.map(toRouteStop));
        }
      } catch {
        if (!cancelled) {
          persistRouteId(null);
          setRouteName(null);
          setRouteVisibility(null);
          setRouteDescription(null);
          setStops([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async (id: number) => {
    const detail = await getRouteDetail(id);
    setStops(detail.spots.map(toRouteStop));
  }, []);

  const addToRoute = useCallback(
    async (spotIds: number[]) => {
      if (spotIds.length === 0) return false;
      setError(null);
      try {
        if (routeId === null) {
          const detail = await createRoute({
            name: "내 루트",
            visibility: "PRIVATE",
            spots: spotIds.map((spotId, i) => ({ spotId, sequenceOrder: i + 1 })),
          });
          persistRouteId(detail.routeId);
          setRouteName(detail.name);
          setRouteVisibility(detail.visibility);
          setRouteDescription(detail.description);
          setStops(detail.spots.map(toRouteStop));
          return true;
        }

        let nextOrder = stops.length + 1;
        for (const spotId of spotIds) {
          await addRouteSpot(routeId, spotId, nextOrder);
          nextOrder += 1;
        }
        await refresh(routeId);
        return true;
      } catch {
        setError("스팟을 추가하지 못했어요.");
        return false;
      }
    },
    [routeId, stops.length, refresh],
  );

  const removeFromRoute = useCallback(
    async (routeSpotId: number) => {
      if (routeId === null) return false;
      setError(null);
      try {
        await removeRouteSpot(routeId, routeSpotId);
        await refresh(routeId);
        return true;
      } catch {
        setError("스팟을 삭제하지 못했어요.");
        return false;
      }
    },
    [routeId, refresh],
  );

  const reorderRoute = useCallback(
    async (orderedRouteSpotIds: number[]) => {
      if (routeId === null) return false;
      const prevStops = stops;
      // optimistic reorder
      setStops((prev) => {
        const byId = new Map(prev.map((s) => [Number(s.id), s]));
        return orderedRouteSpotIds
          .map((id) => byId.get(id))
          .filter((s): s is RouteStop => Boolean(s));
      });
      try {
        await reorderRouteSpots(
          routeId,
          orderedRouteSpotIds.map((id, i) => ({ routeSpotId: id, sequenceOrder: i + 1 })),
        );
        return true;
      } catch {
        setStops(prevStops);
        setError("순서를 변경하지 못했어요.");
        return false;
      }
    },
    [routeId, stops],
  );

  const clearRoute = useCallback(async () => {
    if (routeId === null) return false;
    setError(null);
    try {
      await deleteRoute(routeId);
      persistRouteId(null);
      setRouteName(null);
      setRouteVisibility(null);
      setRouteDescription(null);
      setStops([]);
      return true;
    } catch {
      setError("루트를 비우지 못했어요.");
      return false;
    }
  }, [routeId]);

  const switchRoute = useCallback(async (id: number) => {
    setError(null);
    setLoading(true);
    try {
      const detail = await getRouteDetail(id);
      persistRouteId(id);
      setRouteName(detail.name);
      setRouteVisibility(detail.visibility);
      setRouteDescription(detail.description);
      setStops(detail.spots.map(toRouteStop));
    } catch {
      setError("루트를 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  }, []);

  const renameRoute = useCallback(
    async (name: string) => {
      if (routeId === null) return;
      setError(null);
      try {
        // 서버 PATCH가 요청에 없는 필드를 null로 덮어쓰는 버그(Server #140) 때문에,
        // 고쳐질 때까지 현재 description/visibility도 항상 같이 보낸다
        const detail = await updateRoute(routeId, {
          name,
          description: routeDescription ?? undefined,
          visibility: routeVisibility ?? undefined,
        });
        setRouteName(detail.name);
        setRouteDescription(detail.description);
        setRouteVisibility(detail.visibility);
      } catch {
        setError("이름을 변경하지 못했어요.");
      }
    },
    [routeId, routeDescription, routeVisibility],
  );

  const toggleRouteVisibility = useCallback(async () => {
    if (routeId === null || routeVisibility === null) return false;
    setError(null);
    const next: RouteVisibility = routeVisibility === "PUBLIC" ? "PRIVATE" : "PUBLIC";
    const prev = routeVisibility;
    setRouteVisibility(next);
    try {
      // 서버 PATCH가 요청에 없는 필드를 null로 덮어쓰는 버그(Server #140) 때문에,
      // 고쳐질 때까지 현재 name/description도 항상 같이 보낸다
      const detail = await updateRoute(routeId, {
        visibility: next,
        name: routeName ?? undefined,
        description: routeDescription ?? undefined,
      });
      setRouteVisibility(detail.visibility);
      setRouteDescription(detail.description);
      setRouteName(detail.name);
      return true;
    } catch {
      setRouteVisibility(prev);
      setError("공개 설정을 변경하지 못했어요.");
      return false;
    }
  }, [routeId, routeVisibility, routeName, routeDescription]);

  const clearRouteReference = useCallback(() => {
    persistRouteId(null);
    setRouteName(null);
    setRouteVisibility(null);
    setRouteDescription(null);
    setStops([]);
  }, []);

  const inRoute = useCallback(
    (spotId: string) => stops.some((s) => String(s.spotId) === spotId),
    [stops],
  );

  const toggleRoute = useCallback(
    (spotId: string) => {
      const numericId = Number(spotId);
      if (!Number.isFinite(numericId)) return;
      const existing = stops.find((s) => s.spotId === numericId);
      if (existing) {
        void removeFromRoute(Number(existing.id));
      } else {
        void addToRoute([numericId]);
      }
    },
    [stops, addToRoute, removeFromRoute],
  );

  const value = useMemo<RouteContextValue>(
    () => ({
      routeId,
      routeName,
      routeVisibility,
      stops,
      loading,
      error,
      routeIds: stops.map((s) => s.id),
      inRoute,
      toggleRoute,
      addToRoute,
      removeFromRoute,
      reorderRoute,
      clearRoute,
      switchRoute,
      renameRoute,
      toggleRouteVisibility,
      clearRouteReference,
    }),
    [
      routeId,
      routeName,
      routeVisibility,
      stops,
      loading,
      error,
      inRoute,
      toggleRoute,
      addToRoute,
      removeFromRoute,
      reorderRoute,
      clearRoute,
      switchRoute,
      renameRoute,
      toggleRouteVisibility,
      clearRouteReference,
    ],
  );

  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>;
}
