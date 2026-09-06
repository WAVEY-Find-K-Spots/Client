export interface StampItem {
  id: string;
  name: string;
  region: string;
  earned: boolean;
  dateShort?: string;
  gradient?: string;
  kContent?: string;
}

export interface RegionFilter {
  key: string;
  label: string;
}

export interface BadgeItem {
  id: string;
  name: string;
  icon: string;
  gradient: string;
  condition: string;
  date?: string;
  progress?: number;
  total?: number;
  earned: boolean;
}

// Region quick filters (한국 여행 지역)
export const stampRegions: RegionFilter[] = [
  { key: "all", label: "전체" },
  { key: "seoul", label: "서울" },
  { key: "busan", label: "부산" },
  { key: "gyeongju", label: "경주" },
  { key: "jeju", label: "제주" },
];

// K-스팟 스탬프 컬렉션
// 획득 12개 (서울 6 + 부산 2 + 경주 2 + 제주 1 + 수원 1) — 방문 지역 5곳
export const stamps: StampItem[] = [
  // 서울 — 획득 (핵심 K-스팟)
  {
    id: "st-gyeongbokgung",
    name: "경복궁",
    region: "seoul",
    earned: true,
    dateShort: "2024.03.22",
    gradient: "linear-gradient(158deg,#7a3d28,#c96a42)",
    kContent: "눈물의 여왕 촬영지",
  },
  {
    id: "st-bukchon",
    name: "북촌한옥마을",
    region: "seoul",
    earned: true,
    dateShort: "2024.03.22",
    gradient: "linear-gradient(158deg,#2f5e4f,#5fb493)",
    kContent: "사이코지만 괜찮아 촬영지",
  },
  {
    id: "st-gwanghwamun",
    name: "광화문광장",
    region: "seoul",
    earned: true,
    dateShort: "2024.03.15",
    gradient: "linear-gradient(158deg,#5b4936,#b59a78)",
    kContent: "도깨비 촬영지",
  },
  {
    id: "st-namsan",
    name: "남산타워",
    region: "seoul",
    earned: true,
    dateShort: "2024.03.18",
    gradient: "linear-gradient(158deg,#7a2f5e,#c85f8e)",
    kContent: "사랑의 불시착 촬영지",
  },
  {
    id: "st-hanriver",
    name: "한강공원",
    region: "seoul",
    earned: true,
    dateShort: "2024.04.02",
    gradient: "linear-gradient(158deg,#7a2f5e,#c85f8e)",
    kContent: "Dynamite MV 촬영지",
  },
  {
    id: "st-changdeokgung",
    name: "창덕궁",
    region: "seoul",
    earned: true,
    dateShort: "2024.03.28",
    gradient: "linear-gradient(158deg,#7a3d28,#c96a42)",
    kContent: "옷소매 붉은 끝동 촬영지",
  },
  // 서울 — 미획득
  { id: "st-insadong", name: "인사동", region: "seoul", earned: false },
  { id: "st-myeongdong", name: "명동", region: "seoul", earned: false },
  { id: "st-itaewon", name: "이태원", region: "seoul", earned: false },
  // 부산 — 획득 2 / 미획득
  {
    id: "st-haeundae",
    name: "해운대해변",
    region: "busan",
    earned: true,
    dateShort: "2024.05.11",
    gradient: "linear-gradient(150deg,#d08b4a,#8a552e)",
    kContent: "바다 위 드라마 명장면",
  },
  {
    id: "st-gamcheon",
    name: "감천문화마을",
    region: "busan",
    earned: true,
    dateShort: "2024.05.11",
    gradient: "linear-gradient(150deg,#c0573f,#7a2e28)",
    kContent: "알록달록 언덕 마을",
  },
  { id: "st-gwangalli", name: "광안리해변", region: "busan", earned: false },
  { id: "st-taejongdae", name: "태종대", region: "busan", earned: false },
  // 경주 — 획득 2 / 미획득
  {
    id: "st-cheomseongdae",
    name: "첨성대",
    region: "gyeongju",
    earned: true,
    dateShort: "2024.06.05",
    gradient: "linear-gradient(150deg,#a48a5c,#6b5a3a)",
    kContent: "천년 고도의 별빛",
  },
  {
    id: "st-bulguk",
    name: "불국사",
    region: "gyeongju",
    earned: true,
    dateShort: "2024.06.05",
    gradient: "linear-gradient(150deg,#6f7d45,#45532a)",
    kContent: "석가탑과 다보탑",
  },
  { id: "st-anapji", name: "안압지", region: "gyeongju", earned: false },
  // 제주 — 획득 1 / 미획득
  {
    id: "st-seongsan",
    name: "성산일출봉",
    region: "jeju",
    earned: true,
    dateShort: "2024.07.08",
    gradient: "linear-gradient(150deg,#d2753f,#8a4a24)",
    kContent: "일출 명소의 새벽",
  },
  { id: "st-hyeopjae", name: "협재해변", region: "jeju", earned: false },
  { id: "st-udo", name: "우도", region: "jeju", earned: false },
  // 수원 — 획득 1 (방문 지역 5곳)
  {
    id: "st-hwaseong",
    name: "수원화성",
    region: "suwon",
    earned: true,
    dateShort: "2024.04.20",
    gradient: "linear-gradient(150deg,#b0673c,#6b3f28)",
    kContent: "장용영 행차 영상",
  },
  { id: "st-hwaseonghaenggung", name: "화성행궁", region: "suwon", earned: false },
];

// 획득 뱃지 3개
export const earnedBadges: BadgeItem[] = [
  {
    id: "bd-seoul-explorer",
    name: "서울 탐험가",
    icon: "map",
    gradient: "linear-gradient(160deg,#A8623E,#6B3F28)",
    condition: "서울 스팟 5곳 방문",
    date: "2024.03.15",
    earned: true,
  },
  {
    id: "bd-palace-master",
    name: "궁궐 마스터",
    icon: "landmark",
    gradient: "linear-gradient(160deg,#4A6B3A,#2A3F26)",
    condition: "서울 4대 궁궐 모두 방문",
    date: "2024.03.20",
    earned: true,
  },
  {
    id: "bd-drama-hunter",
    name: "K-드라마 헌터",
    icon: "film",
    gradient: "linear-gradient(160deg,#2B4A7A,#1A2E4F)",
    condition: "드라마 촬영지 3곳 방문",
    date: "2024.03.22",
    earned: true,
  },
];

// 도전 중 뱃지 5개
export const pendingBadges: BadgeItem[] = [
  {
    id: "bd-hanriver",
    name: "한강 러버",
    icon: "map",
    gradient: "linear-gradient(160deg,#A8623E,#6B3F28)",
    condition: "한강 스팟 5곳 방문",
    progress: 3,
    total: 5,
    earned: false,
  },
  {
    id: "bd-kpop",
    name: "K-POP 성지 순례자",
    icon: "map",
    gradient: "linear-gradient(160deg,#A8623E,#6B3F28)",
    condition: "K-POP 촬영지 5곳 방문",
    progress: 2,
    total: 5,
    earned: false,
  },
  {
    id: "bd-street-walker",
    name: "전통 골목 산책가",
    icon: "landmark",
    gradient: "linear-gradient(160deg,#4A6B3A,#2A3F26)",
    condition: "북촌·인사동 골목 6곳 방문",
    progress: 2,
    total: 6,
    earned: false,
  },
  {
    id: "bd-night-shot",
    name: "야경 포토그래퍼",
    icon: "film",
    gradient: "linear-gradient(160deg,#2B4A7A,#1A2E4F)",
    condition: "남산 야경 스팟 4곳 방문",
    progress: 1,
    total: 4,
    earned: false,
  },
  {
    id: "bd-museum",
    name: "전통 문화 탐험가",
    icon: "map",
    gradient: "linear-gradient(160deg,#A8623E,#6B3F28)",
    condition: "전통 문화 스팟 8곳 방문",
    progress: 4,
    total: 8,
    earned: false,
  },
];