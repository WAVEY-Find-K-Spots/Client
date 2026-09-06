import { useMemo, useState } from "react";
import StatusBar from "@/components/layout/StatusBar";
import MiniMapThumb from "./MiniMapThumb";
import SubHeader from "./SubHeader";
import {
  Plus,
  ChevronsUpDown,
  MapPin,
  Route as RouteIcon,
  Clock,
  Trash2,
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
  distanceKm: number;
  time: string;
  createdOrder: number;
  colors: string[];
}

const SEED: RouteDemo[] = [
  {
    id: "rt-palace",
    name: "경복궁 궁궐 투어",
    count: 3,
    distance: "12.4km",
    distanceKm: 12.4,
    time: "약 2시간 30분",
    createdOrder: 3,
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
    distanceKm: 8.2,
    time: "약 1시간 40분",
    createdOrder: 2,
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
    distanceKm: 18.7,
    time: "약 3시간 20분",
    createdOrder: 1,
    colors: [
      "linear-gradient(158deg,#7a3d28,#c96a42)",
      "linear-gradient(158deg,#7a3d28,#c96a42)",
      "linear-gradient(158deg,#2f5e4f,#5fb493)",
      "linear-gradient(158deg,#5b4936,#b59a78)",
    ],
  },
];

type Sort = "recent" | "name" | "distance";
const sortOrder: Sort[] = ["recent", "name", "distance"];
const sortLabel: Record<Sort, string> = {
  recent: "최신순",
  name: "이름순",
  distance: "거리순",
};

export default function MyRoutesView({ onBack, onToast }: MyRoutesViewProps) {
  const [list, setList] = useState<RouteDemo[]>(SEED);
  const [sort, setSort] = useState<Sort>("recent");

  const navigate = (
    window as unknown as { REACT_APP_NAVIGATE?: (p: string) => void }
  ).REACT_APP_NAVIGATE;

  const goCreate = () => navigate?.("/route");

  const sorted = useMemo(() => {
    const arr = [...list];
    if (sort === "recent") arr.sort((a, b) => b.createdOrder - a.createdOrder);
    else if (sort === "name") arr.sort((a, b) => a.name.localeCompare(b.name, "ko"));
    else arr.sort((a, b) => b.distanceKm - a.distanceKm);
    return arr;
  }, [list, sort]);

  const cycleSort = () =>
    setSort((s) => sortOrder[(sortOrder.indexOf(s) + 1) % sortOrder.length]);

  const remove = (id: string, name: string) => {
    setList((l) => l.filter((r) => r.id !== id));
    onToast(`‘${name}’ 루트를 삭제했어요`);
  };

  return (
    <div className="min-h-full bg-page">
      <StatusBar variant="dark" />
      <SubHeader
        title="내 루트 목록"
        onBack={onBack}
        right={
          <button
            type="button"
            onClick={goCreate}
            aria-label="새 루트 만들기"
            className="flex items-center justify-center w-9 h-9 rounded-2xl bg-ink cursor-pointer whitespace-nowrap"
          >
            <Plus size={18} color="#FFFFFF" strokeWidth={2.2} />
          </button>
        }
      />

      {/* 정렬 */}
      <div className="px-5 mt-4 flex items-center justify-between">
        <span className="text-[12px] text-muted">{list.length}개 루트</span>
        <button
          type="button"
          onClick={cycleSort}
          className="flex items-center gap-1 cursor-pointer whitespace-nowrap"
        >
          <span className="text-[12px] font-medium text-muted">{sortLabel[sort]}</span>
          <ChevronsUpDown size={14} color="#A89890" strokeWidth={2} />
        </button>
      </div>

      {/* 카드 리스트 */}
      <div className="px-5 mt-3 flex flex-col gap-4">
        {sorted.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-[16px] shadow-soft overflow-hidden"
          >
            <button
              type="button"
              onClick={() => navigate?.("/route")}
              className="block w-full text-left cursor-pointer"
            >
              <MiniMapThumb count={r.count} />
              <div className="p-4 pb-2">
                <h3 className="text-[15px] font-semibold text-ink">{r.name}</h3>
                <div className="mt-2 flex items-center flex-wrap gap-x-3 gap-y-1 text-[12px] text-muted">
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <MapPin size={13} color="#A89890" strokeWidth={2} />
                    {r.count}개 스팟
                  </span>
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <RouteIcon size={13} color="#A89890" strokeWidth={2} />
                    {r.distance}
                  </span>
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <Clock size={13} color="#A89890" strokeWidth={2} />
                    {r.time}
                  </span>
                </div>
              </div>
            </button>
            <div className="px-4 pb-3 pt-1 flex items-center justify-between">
              <div className="flex -space-x-2">
                {r.colors.map((c, i) => (
                  <span
                    key={i}
                    className="w-7 h-7 rounded-full border-2 border-white"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => remove(r.id, r.name)}
                aria-label={`${r.name} 삭제`}
                className="flex items-center gap-1 text-[12px] font-medium text-muted cursor-pointer whitespace-nowrap"
              >
                <Trash2 size={14} color="#A89890" strokeWidth={2} />
                삭제
              </button>
            </div>
          </div>
        ))}

        {list.length === 0 && (
          <p className="text-center text-[13px] text-muted py-6">
            저장된 루트가 없어요
          </p>
        )}

        <button
          type="button"
          onClick={goCreate}
          className="w-full h-[80px] rounded-[16px] border border-dashed border-line flex flex-col items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
        >
          <Plus size={18} color="#A89890" strokeWidth={2} />
          <span className="text-[14px] font-medium text-muted">새 루트 만들기</span>
        </button>
      </div>

      <div className="h-24" />
    </div>
  );
}
