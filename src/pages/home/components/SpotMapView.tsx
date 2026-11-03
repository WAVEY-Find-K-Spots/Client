import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { ChevronRight, Crosshair, RefreshCw, Star, X } from "lucide-react";
import { getHomeSpots } from "@/lib/home-page-api";
import { getCurrentCoords, type LatLng } from "@/lib/geo";
import type { SpotCategory } from "@/lib/routes-api";
import { getStampCategoryTheme } from "@/pages/stamp/stamp-themes";
import { toHomeSpotView, type HomeSpotView } from "../adapters";
import { formatKm } from "../distance";
import { clusterByCell } from "../spot-map-cluster";

interface SpotMapViewProps {
  category?: SpotCategory;
  regionId: number | null;
  minRating: number;
  radiusMeters: number | null;
  onOpen: (id: string) => void;
  onToast: (message: string) => void;
}

interface SearchArea extends LatLng {
  radius: number;
  /** 이 검색 영역을 만들 때의 필터. 필터가 바뀌면 영역을 버린다 */
  filterKey: string;
}

type MappedSpot = HomeSpotView & { coord: LatLng };

const SEOUL_CENTER: LatLng = { lat: 37.5665, lng: 126.978 };
const DEFAULT_RADIUS_METERS = 5000;
const MAX_RADIUS_METERS = 100_000;
const MAP_PAGE_SIZE = 100;
const CLUSTER_CELL_PX = 56;
const CLUSTER_MAX_ZOOM = 17;
const INK = "#2C1810";

/** 서버 검색이 허용하는 좌표 범위(대한민국) */
function isSearchable({ lat, lng }: LatLng) {
  return lat >= 33 && lat <= 38.7 && lng >= 124.5 && lng <= 132;
}

function pinIcon(category: SpotCategory, selected: boolean) {
  const size = selected ? 34 : 26;
  const color = getStampCategoryTheme(category).accent;
  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="width:${size}px;height:${size}px;border-radius:999px;background:${color};border:3px solid #fff;box-shadow:0 2px 8px rgba(44,24,16,0.35)"></div>`,
  });
}

function clusterIcon(count: number) {
  const size = count >= 20 ? 46 : 38;
  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:999px;background:${INK};border:3px solid #fff;color:#fff;font-size:13px;font-weight:700;box-shadow:0 2px 8px rgba(44,24,16,0.35)">${count}</div>`,
  });
}

function radiusLabel(meters: number) {
  return meters >= 1000 ? `${Math.round(meters / 1000)}km` : `${Math.round(meters)}m`;
}

export default function SpotMapView({
  category,
  regionId,
  minRating,
  radiusMeters,
  onOpen,
  onToast,
}: SpotMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const spotLayerRef = useRef<L.LayerGroup | null>(null);
  const userLayerRef = useRef<L.LayerGroup | null>(null);
  // 코드로 지도를 옮길 때는 "이 지역 다시 검색" 버튼을 띄우지 않는다
  const programmaticMoveRef = useRef(false);
  const fitNextResultRef = useRef(true);
  const onToastRef = useRef(onToast);
  onToastRef.current = onToast;

  const [origin, setOrigin] = useState<LatLng | null>(null);
  const [userCoords, setUserCoords] = useState<LatLng | null>(null);
  const [manualArea, setManualArea] = useState<SearchArea | null>(null);
  const [spots, setSpots] = useState<MappedSpot[]>([]);
  const [resultCount, setResultCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [moved, setMoved] = useState(false);
  const [zoomTick, setZoomTick] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filterKey = [category, regionId, minRating, radiusMeters].join("|");
  const area = manualArea?.filterKey === filterKey ? manualArea : null;
  const usesRegion = regionId != null && !area;
  const searchRadius = area?.radius ?? radiusMeters ?? DEFAULT_RADIUS_METERS;
  const areaLat = area?.lat;
  const areaLng = area?.lng;

  // 지도는 한 번만 만든다
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: true,
    }).setView([SEOUL_CENTER.lat, SEOUL_CENTER.lng], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);
    spotLayerRef.current = L.layerGroup().addTo(map);
    userLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    map.on("dragstart", () => setMoved(true));
    map.on("zoomstart", () => {
      if (!programmaticMoveRef.current) setMoved(true);
    });
    map.on("moveend", () => {
      programmaticMoveRef.current = false;
    });
    map.on("zoomend", () => setZoomTick((tick) => tick + 1));
    map.on("click", () => setSelectedId(null));

    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      spotLayerRef.current = null;
      userLayerRef.current = null;
    };
  }, []);

  // 처음에는 내 위치를 기준으로, 쓸 수 없으면 서울 중심을 기준으로 찾는다
  useEffect(() => {
    let cancelled = false;
    getCurrentCoords()
      .then((coords) => {
        if (cancelled) return;
        setUserCoords(coords);
        if (isSearchable(coords)) {
          setOrigin(coords);
        } else {
          setOrigin(SEOUL_CENTER);
          onToastRef.current("현재 위치가 국내가 아니라 서울 주변을 보여드려요");
        }
      })
      .catch(() => {
        if (cancelled) return;
        setOrigin(SEOUL_CENTER);
        onToastRef.current("위치를 사용할 수 없어 서울 주변을 보여드려요");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const layer = userLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    if (!userCoords) return;
    L.circleMarker([userCoords.lat, userCoords.lng], {
      radius: 7,
      color: "#fff",
      weight: 3,
      fillColor: "#2563EB",
      fillOpacity: 1,
      interactive: false,
    }).addTo(layer);
  }, [userCoords]);

  // 필터나 검색 영역이 바뀌면 다시 불러온다
  useEffect(() => {
    if (!origin) return;
    let cancelled = false;
    const center =
      areaLat != null && areaLng != null ? { lat: areaLat, lng: areaLng } : origin;
    setLoading(true);
    setLoadError(false);
    setSelectedId(null);
    getHomeSpots({
      category,
      minRating: minRating || undefined,
      size: MAP_PAGE_SIZE,
      ...(usesRegion
        ? { regionId: regionId ?? undefined, sort: "POPULAR" as const }
        : {
            regionId: regionId ?? undefined,
            latitude: center.lat,
            longitude: center.lng,
            radiusMeters: searchRadius,
            sort: "DISTANCE" as const,
          }),
    })
      .then((result) => {
        if (cancelled) return;
        const views = result.spots.map(toHomeSpotView);
        setSpots(
          views.filter((spot): spot is MappedSpot => spot.coord !== null),
        );
        setResultCount(views.length);
        setHasMore(result.hasNext);
      })
      .catch(() => {
        if (cancelled) return;
        setSpots([]);
        setResultCount(0);
        setHasMore(false);
        setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [
    areaLat,
    areaLng,
    category,
    minRating,
    origin,
    regionId,
    retryKey,
    searchRadius,
    usesRegion,
  ]);

  // 새 결과가 오면 지도를 결과에 맞춘다 (사용자가 직접 고른 영역은 그대로 둔다)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !origin || loading || !fitNextResultRef.current) return;
    fitNextResultRef.current = false;
    programmaticMoveRef.current = true;
    setMoved(false);
    if (spots.length > 0) {
      const points = spots.map((s) => [s.coord.lat, s.coord.lng] as [number, number]);
      if (!usesRegion) points.push([origin.lat, origin.lng]);
      map.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 15 });
    } else {
      map.setView([origin.lat, origin.lng], 14);
    }
  }, [loading, origin, spots, usesRegion]);

  useEffect(() => {
    fitNextResultRef.current = true;
  }, [filterKey]);

  // 핀과 묶음을 그린다
  useEffect(() => {
    const map = mapRef.current;
    const layer = spotLayerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    const zoom = map.getZoom();
    const points = spots.map((spot) => {
      const projected = map.project([spot.coord.lat, spot.coord.lng], zoom);
      return { item: spot, x: projected.x, y: projected.y };
    });
    const clusters =
      zoom >= CLUSTER_MAX_ZOOM
        ? points.map((point) => ({ items: [point.item], x: point.x, y: point.y }))
        : clusterByCell(points, CLUSTER_CELL_PX);

    for (const cluster of clusters) {
      if (cluster.items.length === 1) {
        const spot = cluster.items[0];
        const selected = spot.id === selectedId;
        L.marker([spot.coord.lat, spot.coord.lng], {
          icon: pinIcon(spot.category, selected),
          title: spot.name,
          zIndexOffset: selected ? 1000 : 0,
        })
          .on("click", () => setSelectedId(spot.id))
          .addTo(layer);
      } else {
        const center = map.unproject([cluster.x, cluster.y], zoom);
        L.marker(center, {
          icon: clusterIcon(cluster.items.length),
          title: `스팟 ${cluster.items.length}곳`,
        })
          .on("click", () => {
            programmaticMoveRef.current = true;
            map.fitBounds(
              L.latLngBounds(
                cluster.items.map((s) => [s.coord.lat, s.coord.lng] as [number, number]),
              ),
              { padding: [64, 64], maxZoom: Math.min(zoom + 3, 18) },
            );
          })
          .addTo(layer);
      }
    }
  }, [selectedId, spots, zoomTick]);

  const searchThisArea = () => {
    const map = mapRef.current;
    if (!map) return;
    const center = map.getCenter();
    if (!isSearchable({ lat: center.lat, lng: center.lng })) {
      onToast("국내 지역에서만 찾을 수 있어요");
      return;
    }
    const radius = Math.min(
      MAX_RADIUS_METERS,
      Math.max(1, Math.round(center.distanceTo(map.getBounds().getNorthEast()))),
    );
    fitNextResultRef.current = false;
    setMoved(false);
    setManualArea({ lat: center.lat, lng: center.lng, radius, filterKey });
  };

  const returnToMyLocation = () => {
    getCurrentCoords()
      .then((coords) => {
        setUserCoords(coords);
        if (!isSearchable(coords)) {
          onToast("현재 위치가 국내가 아니에요");
          return;
        }
        fitNextResultRef.current = true;
        setManualArea(null);
        setOrigin(coords);
      })
      .catch(() => onToast("위치 권한이 필요해요"));
  };

  const selected = spots.find((spot) => spot.id === selectedId) ?? null;
  const missingCoords = !loading && resultCount > 0 && spots.length === 0;
  const areaLabel = usesRegion
    ? "선택한 지역"
    : `${area || origin !== SEOUL_CENTER ? "이 주변" : "서울 주변"} ${radiusLabel(searchRadius)}`;

  return (
    <div
      className="relative isolate w-full rounded-[20px] overflow-hidden bg-cream shadow-soft"
      style={{ height: "clamp(400px, calc(100dvh - 340px), 560px)" }}
    >
      <div ref={containerRef} className="absolute inset-0" />

      <div className="absolute z-[1000] left-3 top-3 flex items-center gap-1.5 h-8 px-3 rounded-full bg-white text-[11px] font-semibold text-ink shadow-soft pointer-events-none whitespace-nowrap">
        {loading ? "찾는 중..." : `${areaLabel} · ${spots.length}곳${hasMore ? " 이상" : ""}`}
      </div>

      <button
        type="button"
        onClick={returnToMyLocation}
        aria-label="내 위치로 이동"
        className="absolute z-[1000] right-3 top-3 flex items-center justify-center w-9 h-9 rounded-full bg-white shadow-soft cursor-pointer"
      >
        <Crosshair size={17} color="#2C1810" strokeWidth={1.9} />
      </button>

      {moved && !loading && (
        <button
          type="button"
          onClick={searchThisArea}
          className="absolute z-[1000] left-1/2 -translate-x-1/2 top-14 flex items-center gap-1.5 h-9 px-4 rounded-full bg-ink text-white text-[12px] font-semibold shadow-soft cursor-pointer whitespace-nowrap"
        >
          <RefreshCw size={13} color="#FFFFFF" strokeWidth={2.2} />이 지역 다시 검색
        </button>
      )}

      {!loading && (loadError || missingCoords || spots.length === 0) && !selected && (
        <div className="absolute z-[1000] inset-x-3 bottom-7 rounded-[16px] bg-white p-4 shadow-soft text-center">
          <p className="text-[13px] font-semibold text-ink">
            {loadError
              ? "스팟을 불러오지 못했어요"
              : missingCoords
                ? "지도에 표시할 위치 정보가 없어요"
                : "이 주변에 조건에 맞는 스팟이 없어요"}
          </p>
          {loadError ? (
            <button
              type="button"
              onClick={() => setRetryKey((key) => key + 1)}
              className="mt-2 h-9 px-4 rounded-full bg-cream text-[12px] font-semibold text-brand cursor-pointer"
            >
              다시 시도
            </button>
          ) : (
            !missingCoords && (
              <p className="mt-1 text-[12px] text-muted">
                지도를 옮기거나 필터를 조정해 보세요
              </p>
            )
          )}
        </div>
      )}

      {selected && (
        <div className="absolute z-[1000] inset-x-3 bottom-7 flex items-center gap-3 rounded-[16px] bg-white p-2.5 shadow-soft">
          <button
            type="button"
            onClick={() => onOpen(selected.id)}
            aria-label={`${selected.name} 상세 보기`}
            className="flex flex-1 min-w-0 items-center gap-3 text-left cursor-pointer"
          >
            <img
              src={selected.image}
              alt=""
              className="w-[72px] h-[72px] rounded-[12px] object-cover shrink-0"
              onError={(e) => {
                if (e.currentTarget.src !== selected.fallbackImage) {
                  e.currentTarget.src = selected.fallbackImage;
                }
              }}
            />
            <span className="flex-1 min-w-0">
              <span className="block text-[11px] font-semibold text-brand">
                {selected.typeLabel}
              </span>
              <span className="block truncate text-[14px] font-semibold text-ink mt-0.5">
                {selected.name}
              </span>
              {selected.desc && (
                <span className="block truncate text-[11px] text-muted mt-0.5">
                  {selected.desc}
                </span>
              )}
              <span className="flex items-center gap-1 text-[11px] text-muted mt-1">
                <Star size={11} color="#A8623E" fill="#A8623E" />
                <span className="font-semibold text-ink">
                  {selected.rating.toFixed(1)}
                </span>
                {selected.distanceKm != null && (
                  <span>· {formatKm(selected.distanceKm)}</span>
                )}
              </span>
            </span>
            <ChevronRight size={18} color="#DDD4CE" className="shrink-0" />
          </button>
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            aria-label="미리보기 닫기"
            className="self-start flex items-center justify-center w-6 h-6 shrink-0 cursor-pointer"
          >
            <X size={15} color="#A89890" />
          </button>
        </div>
      )}
    </div>
  );
}
