import { useEffect, useRef } from "react";
import L from "leaflet";
import type { Spot } from "@/mocks/spots";
import { Crosshair, Layers, ZoomIn, ZoomOut } from "lucide-react";

type MapVariant = "empty" | "plan" | "nav";

interface RouteMapProps {
  variant: MapVariant;
  stops: Spot[];
  currentIndex?: number;
  onLocate?: () => void;
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


export default function RouteMap({ variant, stops, currentIndex, onLocate }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

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
    mapRef.current = map;

    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(containerRef.current);
    requestAnimationFrame(() => map.invalidateSize());

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
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

    if (latlngs.length >= 2) {
      L.polyline(latlngs, {
        color: BRAND,
        weight: variant === "nav" ? 4 : 3,
        opacity: 0.9,
        dashArray: variant === "nav" ? undefined : "6 8",
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
  }, [stopsKey, variant, currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLocate = () => {
    const map = mapRef.current;
    if (map) {
      if (stops.length >= 2) {
        map.fitBounds(L.latLngBounds(stops.map((s) => [s.coord.lat, s.coord.lng])), {
          padding: [48, 48],
          maxZoom: 16,
        });
      } else if (stops.length === 1) {
        map.setView([stops[0].coord.lat, stops[0].coord.lng], 15);
      }
    }
    onLocate?.();
  };

  const zoom = (delta: number) => mapRef.current?.setZoom((mapRef.current?.getZoom() ?? 12) + delta);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div ref={containerRef} className="absolute inset-0 z-0" />

      {variant === "nav" ? (
        <div className="absolute right-3 top-[92px] z-[500] flex flex-col gap-2">
          {[
            { icon: Crosshair, label: "현재 위치", onClick: handleLocate },
            { icon: Layers, label: "지도 레이어", onClick: onLocate },
            { icon: ZoomIn, label: "확대", onClick: () => zoom(1) },
            { icon: ZoomOut, label: "축소", onClick: () => zoom(-1) },
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
                <Icon size={17} color="#2C1810" strokeWidth={1.9} />
              </button>
            );
          })}
        </div>
      ) : (
        <button
          type="button"
          onClick={handleLocate}
          aria-label="현재 위치"
          className="absolute right-3 bottom-3 z-[500] flex items-center justify-center w-9 h-9 rounded-full bg-white cursor-pointer whitespace-nowrap"
          style={{ boxShadow: "0 8px 18px rgba(44,24,16,0.16)" }}
        >
          <Crosshair size={17} color="#2C1810" strokeWidth={1.9} />
        </button>
      )}
    </div>
  );
}
