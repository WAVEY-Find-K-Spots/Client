import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import StatusBar from "@/components/layout/StatusBar";
import RouteMap from "./components/RouteMap";
import PlanSheet, { type TransportMode } from "./components/PlanSheet";
import NavOverlay from "./components/NavOverlay";
import SpotPicker from "./components/SpotPicker";
import { spots } from "@/mocks/spots";
import {
  Plus,
  MoreHorizontal,
  Map,
  Eye,
  Check,
} from "lucide-react";

type RouteMode = "empty" | "plan" | "nav";

const modeLabel: Record<RouteMode, string> = {
  empty: "빈 상태",
  plan: "루트 편집",
  nav: "경로 탐색",
};

const modeOrder: RouteMode[] = ["empty", "plan", "nav"];

const travelData: Record<string, Record<TransportMode, string>> = {
  "gyeongbokgung|bukchon": {
    walk: "도보 42분",
    transit: "지하철 15분",
    car: "자동차 9분",
  },
  "bukchon|gwanghwamun": {
    walk: "도보 8분",
    transit: "지하철 4분",
    car: "자동차 3분",
  },
};

const travelFallback: Record<TransportMode, string> = {
  walk: "도보 18분",
  transit: "대중교통 15분",
  car: "자동차 8분",
};

export default function RouteTab() {
  const [mode, setMode] = useState<RouteMode>("plan");
  const [routeIds, setRouteIds] = useState<string[]>([
    "gyeongbokgung",
    "bukchon",
    "gwanghwamun",
  ]);
  const [transport, setTransport] = useState<TransportMode>("transit");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);

  const navigate = (
    window as unknown as { REACT_APP_NAVIGATE?: (p: string) => void }
  ).REACT_APP_NAVIGATE;

  const stops = routeIds
    .map((id) => spots.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (msg: string) => setToast(msg);

  const travelToNext = (index: number): string => {
    const a = stops[index];
    const b = stops[index + 1];
    if (!b) return travelFallback[transport];
    const val = travelData[`${a.id}|${b.id}`];
    return val ? val[transport] : travelFallback[transport];
  };

  const cycleMode = () => {
    const idx = modeOrder.indexOf(mode);
    const next = modeOrder[(idx + 1) % modeOrder.length];
    if ((next === "plan" || next === "nav") && stops.length === 0) {
      setMode("plan");
      setPickerOpen(true);
      return;
    }
    setMode(next);
    setCurrent(0);
    showToast(modeLabel[next]);
  };

  const handleRemove = (id: string) => {
    const next = routeIds.filter((x) => x !== id);
    setRouteIds(next);
    if (next.length === 0) setMode("empty");
    showToast("루트에서 스팟을 삭제했어요");
  };

  const handleAdd = (ids: string[]) => {
    const merged = [...routeIds];
    ids.forEach((id) => {
      if (!merged.includes(id)) merged.push(id);
    });
    setRouteIds(merged);
    if (routeIds.length === 0) {
      setMode("plan");
      setCurrent(0);
    }
    showToast(`${ids.length}개 스팟을 추가했어요`);
  };

  const startNav = () => {
    setCurrent(0);
    setMode("nav");
  };

  const swapRoute = () => {
    setRouteIds((p) => [...p].reverse());
    setCurrent(0);
    showToast("출발과 도착을 바꿨어요");
  };

  const renderHeader = (right: ReactNode) => (
    <div className="flex items-center justify-between px-5 pt-1 pb-2 shrink-0">
      <h1 className="text-[22px] font-extrabold tracking-tight text-ink">
        내 루트
      </h1>
      <div className="flex items-center gap-2">{right}</div>
    </div>
  );

  return (
    <div className={`relative h-full flex flex-col overflow-hidden pb-[88px] ${mode === "plan" ? "bg-white" : "bg-page"}`}>
      <StatusBar variant="dark" />

      {mode === "empty" && (
        <>
          {renderHeader(
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              aria-label="새 루트 추가"
              className="flex items-center justify-center w-9 h-9 rounded-2xl bg-ink cursor-pointer whitespace-nowrap"
            >
              <Plus size={18} color="#F7EBE0" />
            </button>
          )}
          <div className="relative flex-1 min-h-0">
            <RouteMap variant="empty" stops={stops} />
          </div>
          {/* bottom empty guide card */}
          <div className="bg-white rounded-t-[24px] px-6 pt-8 pb-6 mt-2 flex flex-col items-center text-center">
            <span className="flex items-center justify-center w-12 h-12">
              <Map size={46} color="#DDD4CE" strokeWidth={1.5} />
            </span>
            <h2 className="mt-4 text-[16px] font-semibold text-ink">
              아직 추가된 스팟이 없어요
            </h2>
            <p className="mt-1.5 text-[13px] text-muted leading-relaxed">
              스팟 탭에서 가고 싶은 장소를
              <br />
              루트에 추가해보세요
            </p>
            <button
              type="button"
              onClick={() => navigate?.("/")}
              className="mt-5 w-full h-[52px] rounded-full bg-ink text-white text-[14px] font-semibold cursor-pointer whitespace-nowrap"
            >
              스팟 탐색하러 가기
            </button>
          </div>
        </>
      )}

      {mode === "plan" && (
        <>
          {renderHeader(
            <>
              <button
                type="button"
                onClick={() => showToast("루트를 저장했어요")}
                className="flex items-center gap-1 text-[13px] font-semibold text-brand cursor-pointer whitespace-nowrap"
              >
                <Check size={14} strokeWidth={2.2} />
                저장
              </button>
              <button
                type="button"
                onClick={() => showToast("더보기 메뉴")}
                aria-label="더보기"
                className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-cream cursor-pointer"
              >
                <MoreHorizontal size={20} color="#2C1810" />
              </button>
            </>
          )}
          <div className="h-[55%] shrink-0">
            <RouteMap variant="plan" stops={stops} />
          </div>
          <PlanSheet
            stops={stops}
            transport={transport}
            onTransport={setTransport}
            onRemove={handleRemove}
            onAddPick={() => setPickerOpen(true)}
            onStart={startNav}
            travelToNext={travelToNext}
          />
        </>
      )}

      {mode === "nav" && (
        <div className="relative flex-1 min-h-0">
          <RouteMap
            variant="nav"
            stops={stops}
            currentIndex={current}
            onLocate={() => showToast("현재 위치로 이동")}
          />
          <NavOverlay
            stops={stops}
            current={current}
            onBack={() => setMode("plan")}
            onSwap={swapRoute}
            onPrev={() => {
              if (current > 0) {
                setCurrent((c) => c - 1);
                showToast("이전 스팟으로 이동");
              }
            }}
            onNext={() => {
              if (current < stops.length - 1) {
                setCurrent((c) => c + 1);
              } else {
                setMode("plan");
                showToast("경로 탐색을 마쳤어요");
              }
            }}
            travelToNext={travelToNext}
          />
        </div>
      )}

      {/* preview / state switcher */}
      <button
        type="button"
        onClick={cycleMode}
        aria-label="화면 미리보기 전환"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-1 cursor-pointer whitespace-nowrap"
      >
        <span
          className="flex items-center justify-center w-9 h-9 rounded-full bg-white/95"
          style={{ boxShadow: "0 8px 18px rgba(44,24,16,0.18)" }}
        >
          <Eye size={16} color="#A8623E" strokeWidth={2} />
        </span>
        <span className="px-1.5 py-0.5 rounded-full bg-ink/80 text-[9px] font-medium text-white/90 leading-none">
          {modeLabel[mode]}
        </span>
      </button>

      {/* toast */}
      {toast && (
        <div className="absolute left-1/2 -translate-x-1/2 top-[70px] z-30 px-4 py-2 rounded-full bg-ink/90 text-[12px] font-medium text-white pointer-events-none">
          {toast}
        </div>
      )}

      {/* spot picker sheet */}
      {pickerOpen && (
        <SpotPicker
          existingIds={routeIds}
          onAdd={handleAdd}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}