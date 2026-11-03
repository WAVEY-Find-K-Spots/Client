import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 연달아 추가해도 렌더를 기다리지 않고 최신 값으로 저장하도록 ref로 함께 관리한다
  const routeIdRef = useRef(routeId);
  const stopCountRef = useRef(stops.length);
  const mutationQueueRef = useRef<Promise<unknown>>(Promise.resolve());

  useEffect(() => {
    routeIdRef.current = routeId;
    stopCountRef.current = stops.length;
  }, [routeId, stops.length]);

  /** 추가·삭제를 순서대로 실행해 순서 번호 충돌과 루트 중복 생성을 막는다. */
  const enqueueMutation = useCallback(<T,>(task: () => Promise<T>) => {
    const run = mutationQueueRef.current.then(task, task);
    mutationQueueRef.current = run.catch(() => undefined);
    return run;
  }, []);

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
          setStops(detail.spots.map(toRouteStop));
        }
      } catch {
        if (!cancelled) {
          persistRouteId(null);
          setRouteName(null);
          setRouteVisibility(null);
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
    stopCountRef.current = detail.spots.length;
    setStops(detail.spots.map(toRouteStop));
  }, []);

  const addToRoute = useCallback(
    (spotIds: number[]) =>
      enqueueMutation(async () => {
        if (spotIds.length === 0) return 0;
        setError(null);
        const currentRouteId = routeIdRef.current;
        let added = 0;
        try {
          if (currentRouteId === null) {
            const detail = await createRoute({
              name: "내 루트",
              visibility: "PRIVATE",
              spots: spotIds.map((spotId, i) => ({ spotId, sequenceOrder: i + 1 })),
            });
            routeIdRef.current = detail.routeId;
            stopCountRef.current = detail.spots.length;
            persistRouteId(detail.routeId);
            setRouteName(detail.name);
            setRouteVisibility(detail.visibility);
            setStops(detail.spots.map(toRouteStop));
            return spotIds.length;
          }

          for (const spotId of spotIds) {
            await addRouteSpot(currentRouteId, spotId, stopCountRef.current + 1);
            stopCountRef.current += 1;
            added += 1;
          }
          await refresh(currentRouteId);
          return added;
        } catch {
          setError("스팟을 추가하지 못했어요.");
          // 중간에 실패해도 이미 추가된 스팟은 목록에 반영한다
          if (added > 0 && currentRouteId !== null) {
            await refresh(currentRouteId).catch(() => undefined);
          }
          return added;
        }
      }),
    [enqueueMutation, refresh],
  );

  const removeFromRoute = useCallback(
    (routeSpotId: number) =>
      enqueueMutation(async () => {
        const currentRouteId = routeIdRef.current;
        if (currentRouteId === null) return false;
        setError(null);
        try {
          await removeRouteSpot(currentRouteId, routeSpotId);
          await refresh(currentRouteId);
          return true;
        } catch {
          setError("스팟을 삭제하지 못했어요.");
          return false;
        }
      }),
    [enqueueMutation, refresh],
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
        const detail = await updateRoute(routeId, { name });
        setRouteName(detail.name);
      } catch {
        setError("이름을 변경하지 못했어요.");
      }
    },
    [routeId],
  );

  const toggleRouteVisibility = useCallback(async () => {
    if (routeId === null || routeVisibility === null) return false;
    setError(null);
    const next: RouteVisibility = routeVisibility === "PUBLIC" ? "PRIVATE" : "PUBLIC";
    const prev = routeVisibility;
    setRouteVisibility(next);
    try {
      const detail = await updateRoute(routeId, { visibility: next });
      setRouteVisibility(detail.visibility);
      return true;
    } catch {
      setRouteVisibility(prev);
      setError("공개 설정을 변경하지 못했어요.");
      return false;
    }
  }, [routeId, routeVisibility]);

  const clearRouteReference = useCallback(() => {
    persistRouteId(null);
    setRouteName(null);
    setRouteVisibility(null);
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
