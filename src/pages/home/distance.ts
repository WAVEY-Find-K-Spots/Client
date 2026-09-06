import type { Spot } from "@/mocks/spots";

// 사용자 기준 위치 (서울 시청/광화문 일대 가정)
export const USER_COORD = { lat: 37.566, lng: 126.978 };

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
}

// 스팟과 사용자 위치 간 직선 거리(km)
export function getDistanceKm(spot: Spot): number {
  return haversineKm(USER_COORD, spot.coord);
}

// 화면 표시용 거리 문자열
export function formatKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}