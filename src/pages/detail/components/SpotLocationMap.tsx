import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { ChevronLeft, Crosshair } from "lucide-react";
import { getCurrentCoords, type LatLng } from "@/lib/geo";

interface SpotLocationMapProps {
  coord: LatLng;
  name: string;
  interactive?: boolean;
  userCoords?: LatLng | null;
  className?: string;
}

const PREVIEW_ZOOM = 15;
const FULL_ZOOM = 16;

const SPOT_PIN = L.divIcon({
  className: "",
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  html: `<div style="display:flex;flex-direction:column;align-items:center">
    <div style="width:32px;height:32px;border-radius:999px;background:#A8623E;border:3px solid #fff;box-shadow:0 2px 8px rgba(44,24,16,0.35)"></div>
    <div style="width:0;height:0;margin-top:-1px;border-left:6px solid transparent;border-right:6px solid transparent;border-top:9px solid #A8623E"></div>
  </div>`,
});

/** 스팟 위치를 핀 하나로 보여주는 실제 지도. 기본값은 조작할 수 없는 미리보기다. */
export default function SpotLocationMap({
  coord,
  name,
  interactive = false,
  userCoords = null,
  className = "",
}: SpotLocationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const userLayerRef = useRef<L.LayerGroup | null>(null);
  const { lat, lng } = coord;

  useEffect(() => {
    if (!containerRef.current) return;
    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: true,
      dragging: interactive,
      touchZoom: interactive,
      doubleClickZoom: interactive,
      scrollWheelZoom: interactive,
      boxZoom: interactive,
      keyboard: interactive,
    }).setView([lat, lng], interactive ? FULL_ZOOM : PREVIEW_ZOOM);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);
    L.marker([lat, lng], { icon: SPOT_PIN, title: name, interactive: false }).addTo(map);
    userLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      userLayerRef.current = null;
    };
  }, [interactive, lat, lng, name]);

  // 내 위치를 받으면 스팟과 함께 보이도록 지도를 맞춘다
  useEffect(() => {
    const map = mapRef.current;
    const layer = userLayerRef.current;
    if (!map || !layer) return;
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
    map.fitBounds(
      L.latLngBounds([
        [lat, lng],
        [userCoords.lat, userCoords.lng],
      ]),
      { padding: [64, 64], maxZoom: FULL_ZOOM },
    );
  }, [lat, lng, userCoords]);

  return <div ref={containerRef} className={className} />;
}

interface SpotMapOverlayProps {
  coord: LatLng;
  name: string;
  address: string;
  onClose: () => void;
}

export function SpotMapOverlay({ coord, name, address, onClose }: SpotMapOverlayProps) {
  const [userCoords, setUserCoords] = useState<LatLng | null>(null);
  const [locating, setLocating] = useState(false);
  const [locateFailed, setLocateFailed] = useState(false);

  const showMyLocation = () => {
    if (locating) return;
    setLocating(true);
    setLocateFailed(false);
    getCurrentCoords()
      .then(setUserCoords)
      .catch(() => setLocateFailed(true))
      .finally(() => setLocating(false));
  };

  return (
    <div className="absolute inset-0 z-[60] isolate flex flex-col bg-page">
      <div className="relative z-[1001] flex items-center gap-2 px-3 pt-3 pb-3 bg-white shadow-soft shrink-0">
        <button
          type="button"
          onClick={onClose}
          aria-label="지도 닫기"
          className="flex items-center justify-center w-9 h-9 rounded-full shrink-0 cursor-pointer"
        >
          <ChevronLeft size={22} color="#2C1810" strokeWidth={2.2} />
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[15px] font-semibold text-ink">{name}</h2>
          {address && (
            <p className="truncate text-[12px] text-muted mt-0.5">{address}</p>
          )}
        </div>
      </div>

      <div className="relative flex-1 min-h-0">
        <SpotLocationMap
          coord={coord}
          name={name}
          interactive
          userCoords={userCoords}
          className="absolute inset-0"
        />
        <button
          type="button"
          onClick={showMyLocation}
          disabled={locating}
          aria-label="내 위치 함께 보기"
          className="absolute z-[1000] right-3 bottom-8 flex items-center justify-center w-11 h-11 rounded-full bg-white shadow-soft cursor-pointer disabled:opacity-60"
        >
          <Crosshair size={19} color="#2C1810" strokeWidth={1.9} />
        </button>
        {locateFailed && (
          <p
            role="alert"
            className="absolute z-[1000] left-1/2 -translate-x-1/2 top-3 px-4 py-2 rounded-full bg-ink/90 text-[12px] font-medium text-white whitespace-nowrap"
          >
            위치를 사용할 수 없어요
          </p>
        )}
      </div>
    </div>
  );
}
