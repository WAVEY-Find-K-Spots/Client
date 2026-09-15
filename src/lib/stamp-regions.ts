/**
 * 백엔드 Region 시드와 동일한 매핑 (language=ko|en 시 name 선택).
 */
export type StampRegion = {
  regionId: number;
  nameKo: string;
  nameEn: string;
};

export const STAMP_REGION_DATA: StampRegion[] = [
  { regionId: 1, nameKo: "서울", nameEn: "Seoul" },
  { regionId: 2, nameKo: "부산", nameEn: "Busan" },
  { regionId: 3, nameKo: "대구", nameEn: "Daegu" },
  { regionId: 4, nameKo: "인천", nameEn: "Incheon" },
  { regionId: 5, nameKo: "광주", nameEn: "Gwangju" },
  { regionId: 6, nameKo: "대전", nameEn: "Daejeon" },
  { regionId: 7, nameKo: "울산", nameEn: "Ulsan" },
  { regionId: 8, nameKo: "세종", nameEn: "Sejong" },
  { regionId: 9, nameKo: "경기", nameEn: "Gyeonggi" },
  { regionId: 10, nameKo: "강원", nameEn: "Gangwon" },
  { regionId: 11, nameKo: "충북", nameEn: "Chungbuk" },
  { regionId: 12, nameKo: "충남", nameEn: "Chungnam" },
  { regionId: 13, nameKo: "전북", nameEn: "Jeonbuk" },
  { regionId: 14, nameKo: "전남", nameEn: "Jeonnam" },
  { regionId: 15, nameKo: "경북", nameEn: "Gyeongbuk" },
  { regionId: 16, nameKo: "경남", nameEn: "Gyeongnam" },
  { regionId: 17, nameKo: "제주", nameEn: "Jeju" },
];

export type StampRegionFilter = {
  key: string;
  label: string;
  regionId: number | null;
};

/** 스탬프북 칩: 전체 + 전 지역 (기본 라벨은 한국어) */
export const STAMP_REGIONS: StampRegionFilter[] = [
  { key: "all", label: "전체", regionId: null },
  ...STAMP_REGION_DATA.map((r) => ({
    key: String(r.regionId),
    label: r.nameKo,
    regionId: r.regionId,
  })),
];

export function regionLabel(
  regionId: number | null | undefined,
  language: "ko" | "en" = "ko",
): string | undefined {
  if (regionId == null) return undefined;
  const found = STAMP_REGION_DATA.find((r) => r.regionId === regionId);
  if (!found) return undefined;
  return language === "en" ? found.nameEn : found.nameKo;
}
