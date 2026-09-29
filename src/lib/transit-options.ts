import type { DirectionsSegment, TransitLeg, TransitOption } from "@/lib/routes-api";

/**
 * 구간의 대중교통 경로 후보 목록.
 * 서버가 transitOptions를 아직 내려주지 않으면 구간 대표값으로 후보 1개를 만든다.
 */
export function getSegmentOptions(segment: DirectionsSegment | undefined): TransitOption[] {
  if (!segment) return [];
  if (segment.transitOptions?.length) return segment.transitOptions;
  if (!segment.transitLegs.length) return [];

  const walkLegs = segment.transitLegs.filter((leg) => leg.mode === "WALK");
  const riddenCount = segment.transitLegs.length - walkLegs.length;
  return [
    {
      distanceMeters: segment.distanceMeters,
      durationSeconds: segment.durationSeconds,
      walkDistanceMeters: walkLegs.reduce((sum, leg) => sum + leg.distanceMeters, 0),
      walkSeconds: walkLegs.reduce((sum, leg) => sum + leg.durationSeconds, 0),
      transferCount: Math.max(0, riddenCount - 1),
      fare: 0,
      geometry: segment.geometry,
      legs: segment.transitLegs,
    },
  ];
}

/** Tmap 노선명의 "간선:", "지선:" 같은 분류 접두사를 뗀다 (예: "간선:273" → "273") */
export function displayRouteName(routeName: string | null): string {
  if (!routeName) return "";
  return routeName.split(":").pop()?.trim() ?? routeName;
}

export function isRailLeg(leg: TransitLeg): boolean {
  return leg.mode === "SUBWAY" || leg.mode === "TRAIN";
}

export function toMinutes(seconds: number): number {
  return Math.max(1, Math.round(seconds / 60));
}

/** 18분 / 1시간 5분 */
export function formatDuration(seconds: number): string {
  const minutes = toMinutes(seconds);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${minutes}분`;
  return rest === 0 ? `${hours}시간` : `${hours}시간 ${rest}분`;
}

/** 900m / 4.3km */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

/** 환승 1회 · 도보 6분 · 1,500원 */
export function describeOption(option: TransitOption): string {
  const parts = [
    option.transferCount === 0 ? "환승 없음" : `환승 ${option.transferCount}회`,
    option.walkSeconds > 0 ? `도보 ${toMinutes(option.walkSeconds)}분` : "도보 없음",
  ];
  if (option.fare > 0) parts.push(`${option.fare.toLocaleString("ko-KR")}원`);
  return parts.join(" · ");
}

export function legColor(leg: TransitLeg): string {
  if (leg.mode === "WALK") return "#DDD4CE";
  return leg.routeColor ? `#${leg.routeColor}` : "#A89890";
}
