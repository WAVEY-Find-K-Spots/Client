export interface LatLng {
  lat: number;
  lng: number;
}

export class LocationServicesDisabledError extends Error {
  constructor() {
    super("location-services-disabled");
    this.name = "LocationServicesDisabledError";
  }
}

let locationServicesEnabled = false;
const activeWatchIds = new Set<number>();

export function setLocationServicesEnabled(enabled: boolean) {
  locationServicesEnabled = enabled;
  if (!enabled && "geolocation" in navigator) {
    activeWatchIds.forEach((id) => navigator.geolocation.clearWatch(id));
    activeWatchIds.clear();
  }
}

export function isLocationServicesEnabled() {
  return locationServicesEnabled;
}

/** Great-circle distance in metres (haversine). */
export function distanceMeters(a: LatLng, b: LatLng): number {
  const R = 6_371_000;
  const toRad = (n: number) => (n * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const la1 = toRad(a.lat);
  const la2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(m: number): string {
  return m >= 1000 ? `${(m / 1000).toFixed(1)}km` : `${Math.round(m)}m`;
}

/**
 * Dev/testing override: set `localStorage["wavey.mockGeo"] = "37.5796,126.977"`
 * to pretend the device is at that coordinate. No effect in production unless set.
 */
export function getMockGeo(): LatLng | null {
  try {
    const raw = localStorage.getItem("wavey.mockGeo");
    if (!raw) return null;
    const [lat, lng] = raw.split(",").map((n) => parseFloat(n.trim()));
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  } catch {
    /* ignore */
  }
  return null;
}

const GEO_OPTS = {
  enableHighAccuracy: true,
  timeout: 8000,
  maximumAge: 10_000,
};

function readCurrentCoords(): Promise<LatLng> {
  const mock = getMockGeo();
  if (mock) return Promise.resolve(mock);
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("geolocation-unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      (err) => reject(err),
      GEO_OPTS,
    );
  });
}

export function getCurrentCoords(): Promise<LatLng> {
  if (!locationServicesEnabled) {
    return Promise.reject(new LocationServicesDisabledError());
  }
  return readCurrentCoords();
}

/** 위치 서비스 활성화 과정에서 기기 권한을 먼저 확인할 때 사용합니다. */
export function requestLocationAccess(): Promise<LatLng> {
  return readCurrentCoords();
}

/** Subscribe to position updates. Returns an unsubscribe fn. */
export function watchCoords(
  onUpdate: (c: LatLng) => void,
  onError?: (e: unknown) => void,
): () => void {
  if (!locationServicesEnabled) {
    onError?.(new LocationServicesDisabledError());
    return () => {};
  }
  const mock = getMockGeo();
  if (mock) {
    onUpdate(mock);
    return () => {};
  }
  if (!("geolocation" in navigator)) {
    onError?.(new Error("geolocation-unsupported"));
    return () => {};
  }
  const id = navigator.geolocation.watchPosition(
    (p) => onUpdate({ lat: p.coords.latitude, lng: p.coords.longitude }),
    (err) => onError?.(err),
    { ...GEO_OPTS, timeout: 10_000, maximumAge: 15_000 },
  );
  activeWatchIds.add(id);
  return () => {
    navigator.geolocation.clearWatch(id);
    activeWatchIds.delete(id);
  };
}
