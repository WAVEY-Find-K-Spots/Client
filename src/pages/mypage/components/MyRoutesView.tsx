import StatusBar from "@/components/layout/StatusBar";
import MiniMapThumb from "./MiniMapThumb";
import {
  ChevronLeft,
  Plus,
  ChevronsUpDown,
  MapPin,
  Route as RouteIcon,
  Clock,
  MoreHorizontal,
} from "lucide-react";

interface MyRoutesViewProps {
  onBack: () => void;
  onToast: (msg: string) => void;
}

interface RouteDemo {
  id: string;
  name: string;
  count: number;
  distance: string;
  time: string;
  stopNames: string[];
  colors: string[];
}

const routes: RouteDemo[] = [
  {
    id: "rt-palace",
    name: "경복궁 궁궐 투어",
    count: 3,
    distance: "12.4km",
    time: "약 2시간 30분",
    stopNames: ["경복궁", "북촌한옥마을", "광화문광장"],
    colors: [
      "linear-gradient(158deg,#7a3d28,#c96a42)",
      "linear-gradient(158deg,#2f5e4f,#5fb493)",
      "linear-gradient(158deg,#5b4936,#b59a78)",
    ],
  },
  {
    id: "rt-night",
    name: "서울 야경 루트",
    count: 2,
    distance: "8.2km",
    time: "약 1시간 40분",
    stopNames: ["남산타워", "한강공원"],
    colors: [
      "linear-gradient(158deg,#7a2f5e,#c85f8e)",
      "linear-gradient(158deg,#2f5e4f,#5fb493)",
    ],
  },
  {
    id: "rt-drama",
    name: "K-드라마 성지 순례",
    count: 4,
    distance: "18.7km",
    time: "약 3시간 20분",
    stopNames: ["경복궁", "창덕궁", "북촌한옥마을", "인사동"],
    colors: [
      "linear-gradient(158deg,#7a3d28,#c96a42)",
      "linear-gradient(158deg,#7a3d28,#c96a42)",
      "linear-gradient(158deg,#2f5e4f,#5fb493)",
      "linear-gradient(158deg,#5b4936,#b59a78)",
    ],
  },
];

export default function MyRoutesView({ onBack, onToast }: MyRoutesViewProps) {
  const navigate = (
    window as unknown as { REACT_APP_NAVIGATE?: (p: string) => void }
  ).REACT_APP_NAVIGATE;

  const goCreate = () => navigate?.("/route");

  return (
    <div className="min-h-full bg-page">
      <StatusBar variant="dark" />

      {/* 헤더 */}
      <div className="px-5 pt-1 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로가기"
          className="flex items-center justify-center w-9 h-9 rounded-2xl bg-cream cursor-pointer whitespace-nowrap"
        >
          <span className="flex items-center justify-center w-4 h-4">
            <ChevronLeft size={20} color="#2C1810" strokeWidth={2} />
          </span>
        </button>
        <span className="text-[18px] font-semibold text-ink">
          내 루트 목록
        </span>
        <button
          type="button"
          onClick={goCreate}
          aria-label="새 루트 만들기"
          className="flex items-center justify-center w-9 h-9 rounded-2xl bg-ink cursor-pointer whitespace-nowrap"
        >
          <span className="flex items-center justify-center w-4 h-4">
            <Plus size={18} color="#FFFFFF" strokeWidth={2.2} />
          </span>
        </button>
      </div>

      {/* 정렬 */}
      <div className="px-5 mt-4 flex items-center justify-end">
        <button
          type="button"
          onClick={() => onToast("정렬 옵션이 곧 열려요")}
          className="flex items-center gap-1 cursor-pointer whitespace-nowrap"
        >
          <span className="text-[12px] font-medium text-muted">최신순</span>
          <span className="flex items-center justify-center w-3.5 h-3.5">
            <ChevronsUpDown size={14} color="#A89890" strokeWidth={2} />
          </span>
        </button>
      </div>

      {/* 루트 카드 리스트 */}
      <div className="px-5 mt-3 flex flex-col gap-4">
        {routes.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-[16px] shadow-soft overflow-hidden cursor-pointer"
          >
            {/* 지도 썸네일 */}
            <div className="relative">
              <MiniMapThumb count={r.count} />
            </div>
            {/* 정보 */}
            <div className="p-4">
              <h3 className="text-[15px] font-semibold text-ink">{r.name}</h3>
              <div className="mt-2 flex items-center flex-wrap gap-x-3 gap-y-1 text-[12px] text-muted">
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <span className="flex items-center justify-center w-3.5 h-3.5">
                    <MapPin size={13} color="#A89890" strokeWidth={2} />
                  </span>
                  {r.count}개 스팟
                </span>
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <span className="flex items-center justify-center w-3.5 h-3.5">
                    <RouteIcon size={13} color="#A89890" strokeWidth={2} />
                  </span>
                  {r.distance}
                </span>
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <span className="flex items-center justify-center w-3.5 h-3.5">
                    <Clock size={13} color="#A89890" strokeWidth={2} />
                  </span>
                  {r.time}
                </span>
              </div>
              {/* 하단 스팟 썸네일 + more */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {r.colors.map((c, i) => (
                    <span
                      key={i}
                      className="w-7 h-7 rounded-full border-2 border-white"
                      style={{ background: c }}
                    />
                  ))}
                  <span className="w-7 h-7 rounded-full border-2 border-white bg-cream flex items-center justify-center">
                    <span className="flex items-center justify-center w-3 h-3">
                      <MoreHorizontal size={13} color="#A89890" strokeWidth={2} />
                    </span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onToast("더보기 메뉴가 곧 열려요")}
                  aria-label="더보기"
                  className="flex items-center justify-center w-8 h-8 rounded-full cursor-pointer whitespace-nowrap"
                >
                  <span className="flex items-center justify-center w-4 h-4">
                    <MoreHorizontal size={18} color="#DDD4CE" strokeWidth={2} />
                  </span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* 새 루트 만들기 */}
        <button
          type="button"
          onClick={goCreate}
          className="w-full h-[80px] rounded-[16px] border border-dashed border-line flex flex-col items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
        >
          <span className="flex items-center justify-center w-5 h-5">
            <Plus size={18} color="#A89890" strokeWidth={2} />
          </span>
          <span className="text-[14px] font-medium text-muted">
            새 루트 만들기
          </span>
        </button>
      </div>

      <div className="h-24" />
    </div>
  );
}