import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import type { RouteStop } from "@/lib/route-adapters";
import { getCurrentCoords, type LatLng } from "@/lib/geo";
import { Crosshair, Navigation, ZoomIn, ZoomOut } from "lucide-react";

type MapVariant = "empty" | "plan" | "nav";

interface RouteMapProps {
  variant: MapVariant;
  stops: RouteStop[];
  currentIndex?: number;
  onLocate?: () => void;
  onLocateError?: () => void;
  /** 길찾기 API가 내려준 실제 도로 경로(GeoJSON LineString 좌표, [lng, lat] 순서) */
  routeGeometry?: [number, number][] | null;
  /** 하단 시트가 지도를 가리는 높이(px). 바뀔 때마다 현재 위치가 가려지지 않도록 지도를 살짝 위로 이동시킨다 */
  bottomInset?: number;
  /** 상위 화면에서 위치 버튼을 배치할 때 내부 버튼을 숨긴다 */
  showLocateControl?: boolean;
  locateSignal?: number;
}

// Seoul city center — fallback view when no stops are selected
const SEOUL_CENTER: L.LatLngExpression = [37.5665, 126.978];
const BRAND = "#A8623E";
const INK = "#2C1810";

function pinIcon(label: number, opts: { current?: boolean; emphasized?: boolean }): L.DivIcon {
  const size = opts.current ? 40 : opts.emphasized ? 36 : 28;
  const ring = opts.current
    ? "0 0 0 5px rgba(168,98,62,0.25), 0 2px 8px rgba(44,24,16,0.25)"
    : opts.emphasized
      ? "0 0 0 4px rgba(255,255,255,0.85)"
      : "0 0 0 3px rgba(255,255,255,0.7)";
  const badge = opts.current
    ? `<span style="position:absolute;top:-18px;left:50%;transform:translateX(-50%);white-space:nowrap;padding:1px 6px;border-radius:999px;background:${BRAND};color:#fff;font-size:10px;font-weight:700">현재</span>`
    : "";
  const circle = `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:999px;background:${INK};color:#fff;font-weight:700;font-size:${opts.current ? 16 : opts.emphasized ? 14 : 11}px;box-shadow:${ring}">${badge}${label}</div>`;

  // current spot: centered on the exact coordinate, no pointer tail
  if (opts.current) {
    return L.divIcon({
      className: "",
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      html: `<div style="position:relative;display:flex;align-items:center;justify-content:center">${circle}</div>`,
    });
  }

  return L.divIcon({
    className: "",
    iconSize: [size, size + 6],
    iconAnchor: [size / 2, size + 6],
    html: `
      <div style="position:relative;display:flex;flex-direction:column;align-items:center">
        ${circle}
        <div style="width:0;height:0;margin-top:-1px;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid ${INK}"></div>
      </div>`,
  });
}


export default function RouteMap({
  variant,
  stops,
  currentIndex,
  onLocate,
  onLocateError,
  routeGeometry,
  bottomInset = 0,
  showLocateControl = true,
  locateSignal = 0,
}: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const userLayerRef = useRef<L.LayerGroup | null>(null);
  const [locating, setLocating] = useState(false);
  const prevBottomInset = useRef(bottomInset);

  // 하단 시트가 펼쳐지거나 접힐 때, 가려지는 높이만큼 지도를 부드럽게 이동시켜
  // 현재 위치 마커가 시트 뒤로 숨지 않도록 한다
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const delta = bottomInset - prevBottomInset.current;
    prevBottomInset.current = bottomInset;
    if (delta === 0) return;
    map.panBy([0, delta / 2], { animate: true, duration: 0.3 });
  }, [bottomInset]);

  // init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: true,
    }).setView(SEOUL_CENTER, 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    userLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(containerRef.current);
    requestAnimationFrame(() => map.invalidateSize());

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      userLayerRef.current = null;
    };
  }, []);

  // draw stops + route line whenever selection / variant changes
  const stopsKey = stops.map((s) => s.id).join(",");
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    const latlngs = stops.map((s) => [s.coord.lat, s.coord.lng] as [number, number]);
    const geometryLatLngs = routeGeometry?.map(
      ([lng, lat]) => [lat, lng] as [number, number],
    );

    if (geometryLatLngs && geometryLatLngs.length >= 2) {
      // 실제 도로를 따르는 길찾기 경로(Tmap)가 있으면 그걸 그린다
      L.polyline(geometryLatLngs, {
        color: BRAND,
        weight: variant === "nav" ? 4 : 3,
        opacity: 0.9,
        lineJoin: "round",
      }).addTo(layer);
    } else if (latlngs.length >= 2) {
      // 길찾기 응답이 없으면(계산 중/실패) 스팟을 직선으로 잇는 임시 경로선
      L.polyline(latlngs, {
        color: BRAND,
        weight: variant === "nav" ? 4 : 3,
        opacity: 0.9,
        dashArray: "6 8",
        lineJoin: "round",
      }).addTo(layer);
    }

    stops.forEach((s, i) => {
      const emphasized = variant === "nav" && (i === 0 || i === stops.length - 1);
      const current = variant === "nav" && currentIndex === i;
      const latlng: [number, number] = [s.coord.lat, s.coord.lng];
      if (current) {
        // SVG circle marker — Leaflet projects it exactly onto the coordinate,
        // CSS scales it concentrically (transform-box: fill-box)
        L.circleMarker(latlng, {
          radius: 9,
          weight: 0,
          fillColor: BRAND,
          fillOpacity: 0.3,
          className: "rm-pulse",
          interactive: false,
        }).addTo(layer);
      }
      L.marker(latlng, {
        icon: pinIcon(i + 1, { current, emphasized }),
        zIndexOffset: current ? 1000 : emphasized ? 500 : 0,
      })
        .bindPopup(`<b>${s.name}</b><br>${s.loc}`)
        .addTo(layer);
    });

    if (latlngs.length === 1) {
      map.setView(latlngs[0], 15);
    } else if (latlngs.length >= 2) {
      const focus =
        variant === "nav" && currentIndex !== undefined && latlngs[currentIndex]
          ? L.latLng(latlngs[currentIndex]).toBounds(900)
          : L.latLngBounds(latlngs);
      map.fitBounds(focus, { padding: [48, 48], maxZoom: 16 });
    } else {
      map.setView(SEOUL_CENTER, 12);
    }
  }, [stopsKey, variant, currentIndex, routeGeometry]); // eslint-disable-line react-hooks/exhaustive-deps

  const drawUser = (c: LatLng) => {
    const layer = userLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    L.circle([c.lat, c.lng], {
      radius: 70,
      color: "#2563EB",
      weight: 1,
      opacity: 0.5,
      fillColor: "#2563EB",
      fillOpacity: 0.12,
      interactive: false,
    }).addTo(layer);
    L.circleMarker([c.lat, c.lng], {
      radius: 7,
      color: "#fff",
      weight: 3,
      fillColor: "#2563EB",
      fillOpacity: 1,
      interactive: false,
    }).addTo(layer);
  };

  // move to the device's real location and mark it
  const locateMe = () => {
    const map = mapRef.current;
    if (!map || locating) return;
    setLocating(true);
    getCurrentCoords()
      .then((c) => {
        drawUser(c);
        map.setView([c.lat, c.lng], 16, { animate: true });
        onLocate?.();
      })
      .catch(() => onLocateError?.())
      .finally(() => setLocating(false));
  };

  useEffect(() => {
    if (locateSignal > 0) locateMe();
    // locateSignal intentionally triggers the existing map location flow.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locateSignal]);

  // frame the whole route
  const fitToRoute = () => {
    const map = mapRef.current;
    if (!map) return;
    if (stops.length >= 2) {
      map.fitBounds(
        L.latLngBounds(stops.map((s) => [s.coord.lat, s.coord.lng])),
        { padding: [48, 48], maxZoom: 16 },
      );
    } else if (stops.length === 1) {
      map.setView([stops[0].coord.lat, stops[0].coord.lng], 15);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div ref={containerRef} className="absolute inset-0 z-0" />

      {variant === "nav" ? (
        <div className="absolute right-3 top-[92px] z-[500] flex flex-col gap-2">
          {[
            {
              icon: Crosshair,
              label: "내 위치로 이동",
              onClick: locateMe,
              active: locating,
            },
            { icon: Navigation, label: "경로 전체 보기", onClick: fitToRoute },
            { icon: ZoomIn, label: "확대", onClick: () => mapRef.current?.zoomIn() },
            { icon: ZoomOut, label: "축소", onClick: () => mapRef.current?.zoomOut() },
          ].map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.label}
                type="button"
                onClick={c.onClick}
                aria-label={c.label}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-white cursor-pointer whitespace-nowrap"
                style={{ boxShadow: "0 8px 18px rgba(44,24,16,0.16)" }}
              >
                <span
                  className={`flex items-center justify-center w-[17px] h-[17px] ${
                    c.active ? "animate-pulse" : ""
                  }`}
                >
                  <Icon
                    size={17}
                    color={c.active ? "#A8623E" : "#2C1810"}
                    strokeWidth={1.9}
                  />
                </span>
              </button>
            );
          })}
        </div>
      ) : showLocateControl ? (
        <button
          type="button"
          onClick={locateMe}
          aria-label="내 위치로 이동"
          className="absolute right-3 bottom-3 z-[500] flex items-center justify-center w-9 h-9 rounded-full bg-white cursor-pointer whitespace-nowrap"
          style={{ boxShadow: "0 8px 18px rgba(44,24,16,0.16)" }}
        >
          <span
            className={`flex items-center justify-center w-[17px] h-[17px] ${
              locating ? "animate-pulse" : ""
            }`}
          >
            <Crosshair size={17} color={locating ? "#A8623E" : "#2C1810"} strokeWidth={1.9} />
          </span>
        </button>
      ) : null}
    </div>
  );
}
