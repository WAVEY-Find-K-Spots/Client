import type { CountryCode } from "@/lib/auth/types";

export const countryLabels: Record<CountryCode, string> = {
  KR: "대한민국",
  CN: "중국",
  VN: "베트남",
  TH: "태국",
  UZ: "우즈베키스탄",
  NP: "네팔",
  KH: "캄보디아",
  ID: "인도네시아",
  PH: "필리핀",
  MM: "미얀마",
  MN: "몽골",
  US: "미국",
  KZ: "카자흐스탄",
  LK: "스리랑카",
  RU: "러시아",
  BD: "방글라데시",
};

export const countryCodes = Object.keys(countryLabels) as CountryCode[];
