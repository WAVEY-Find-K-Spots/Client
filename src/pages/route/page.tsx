import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import StatusBar from "@/components/layout/StatusBar";
import RouteMap from "./components/RouteMap";
import PlanSheet, { type TransportMode } from "./components/PlanSheet";
import NavOverlay from "./components/NavOverlay";
import SpotPicker from "./components/SpotPicker";
import { useRoute } from "@/store/route-context";
import { getDirections, type DirectionsResult, type TransportMode as ApiTransportMode } from "@/lib/routes-api";
import {
  Plus,
  MoreHorizontal,
  Map,
  Eye,
  Check,
  Repeat,
  Share2,
  Trash2,
  Pencil,
} from "lucide-react";

type RouteMode = "empty" | "plan" | "nav";

const modeLabel: Record<RouteMode, string> = {
  empty: "빈 상태",
  plan: "루트 편집",
  nav: "경로 탐색",
};

const modeOrder: RouteMode[] = ["empty", "plan", "nav"];

const transportToApi: Record<TransportMode, ApiTransportMode> = {
  walk: "WALK",
  transit: "TRANSIT",
  car: "CAR",
};

const travelFallback: Record<TransportMode, string> = {
  walk: "도보 -분",
  transit: "대중교통 -분",
  car: "자동차 -분",
};

export default function RouteTab() {
  const {
    routeId,
    routeName,
    stops,
    loading: routeLoading,
    addToRoute,
    removeFromRoute,
    reorderRoute,
    clearRoute,
    renameRoute,
  } = useRoute();
  const [mode, setMode] = useState<RouteMode>("empty");
  const [modeInitialized, setModeInitialized] = useState(false);
  const [transport, setTransport] = useState<TransportMode>("transit");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [directions, setDirections] = useState<DirectionsResult | null>(null);
  const [directionsLoading, setDirectionsLoading] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
    setConfirmClear(false);
    setRenaming(false);
  };

  const navigate = (
    window as unknown as { REACT_APP_NAVIGATE?: (p: string) => void }
  ).REACT_APP_NAVIGATE;

  // 초기 로딩이 끝나면 그때 실제 스팟 유무로 화면 모드를 정한다
  useEffect(() => {
    if (routeLoading || modeInitialized) return;
    setMode(stops.length ? "plan" : "empty");
    setModeInitialized(true);
  }, [routeLoading, modeInitialized, stops.length]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (msg: string) => setToast(msg);

  // 스팟이 2개 이상이고 편집/탐색 화면일 때 이동수단별 경로를 계산
  useEffect(() => {
    if (routeId === null || stops.length < 2 || (mode !== "plan" && mode !== "nav")) {
      setDirections(null);
      return;
    }
    let cancelled = false;
    setDirectionsLoading(true);
    getDirections(routeId, transportToApi[transport])
      .then((result) => {
        if (!cancelled) setDirections(result);
      })
      .catch(() => {
        if (!cancelled) setDirections(null);
      })
      .finally(() => {
        if (!cancelled) setDirectionsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [routeId, stops.length, transport, mode]);

  const travelToNext = (index: number): string => {
    const segment = directions?.segments[index];
    return segment?.durationText ?? travelFallback[transport];
  };

  const getTransitLegs = (index: number) => directions?.segments[index]?.transitLegs ?? [];

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
    const wasLast = stops.length <= 1;
    void removeFromRoute(Number(id)).then((ok) => {
      if (!ok) {
        showToast("스팟을 삭제하지 못했어요");
        return;
      }
      if (wasLast) setMode("empty");
      showToast("루트에서 스팟을 삭제했어요");
    });
  };

  const handleAdd = (spotIds: number[]) => {
    const wasEmpty = stops.length === 0;
    void addToRoute(spotIds).then((ok) => {
      if (!ok) {
        showToast("스팟을 추가하지 못했어요");
        return;
      }
      if (wasEmpty) {
        setMode("plan");
        setCurrent(0);
      }
      showToast(`${spotIds.length}개 스팟을 추가했어요`);
    });
  };

  const startNav = () => {
    setCurrent(0);
    setMode("nav");
  };

  const swapRoute = () => {
    void reorderRoute([...stops].reverse().map((s) => Number(s.id))).then((ok) => {
      showToast(ok ? "출발과 도착을 바꿨어요" : "순서를 바꾸지 못했어요");
    });
    setCurrent(0);
  };

  const doClear = () => {
    void clearRoute().then((ok) => {
      showToast(ok ? "루트를 비웠어요" : "루트를 비우지 못했어요");
    });
    setMode("empty");
    setCurrent(0);
    closeMenu();
  };

  const openRename = () => {
    setNameDraft(routeName ?? "");
    setRenaming(true);
  };

  const doRename = () => {
    const name = nameDraft.trim();
    if (!name) return;
    void renameRoute(name);
    closeMenu();
    showToast("루트 이름을 변경했어요");
  };

  const menuItems = [
    {
      icon: Pencil,
      label: "이름 변경",
      onClick: openRename,
      disabled: routeId === null,
    },
    {
      icon: Repeat,
      label: "출발·도착 바꾸기",
      onClick: () => {
        swapRoute();
        closeMenu();
      },
      disabled: stops.length < 2,
    },
    {
      icon: Share2,
      label: "루트 공유하기",
      onClick: () => {
        showToast("루트 링크를 복사했어요");
        closeMenu();
      },
      disabled: stops.length === 0,
    },
    {
      icon: Trash2,
      label: "루트 비우기",
      danger: true,
      onClick: () => setConfirmClear(true),
      disabled: stops.length === 0,
    },
  ];

  const renderHeader = (right: ReactNode) => (
    <div className="flex items-center justify-between px-5 pt-1 pb-2 shrink-0">
      <h1 className="text-[22px] font-extrabold tracking-tight text-ink truncate">
        {routeName ?? "내 루트"}
      </h1>
      <div className="flex items-center gap-2 shrink-0">{right}</div>
    </div>
  );

  if (routeLoading || !modeInitialized) {
    return (
      <div className="relative h-full flex flex-col overflow-hidden pb-[88px] bg-page">
        <StatusBar variant="dark" />
        <div className="flex-1 flex items-center justify-center">
          <span className="w-8 h-8 rounded-full border-2 border-line border-t-brand animate-spin" />
        </div>
      </div>
    );
  }

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
                onClick={() => setMenuOpen(true)}
                aria-label="더보기"
                className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-cream cursor-pointer"
              >
                <MoreHorizontal size={20} color="#2C1810" />
              </button>
            </>
          )}
          <div className="h-[55%] shrink-0">
            <RouteMap
              variant="plan"
              stops={stops}
              routeGeometry={directions?.geometry.coordinates}
            />
          </div>
          <PlanSheet
            stops={stops}
            transport={transport}
            onTransport={setTransport}
            onRemove={handleRemove}
            onReorder={(ids) => {
              void reorderRoute(ids.map(Number)).then((ok) => {
                if (!ok) showToast("순서를 바꾸지 못했어요");
              });
              setCurrent(0);
            }}
            onAddPick={() => setPickerOpen(true)}
            onStart={startNav}
            travelToNext={travelToNext}
            getTransitLegs={getTransitLegs}
            summaryDuration={directionsLoading ? "계산 중..." : directions?.total.durationText}
            summaryDistance={directionsLoading ? undefined : directions?.total.distanceText}
          />
        </>
      )}

      {mode === "nav" && (
        <div className="relative flex-1 min-h-0">
          <RouteMap
            variant="nav"
            stops={stops}
            currentIndex={current}
            routeGeometry={directions?.geometry.coordinates}
            onLocate={() => showToast("현재 위치로 이동했어요")}
            onLocateError={() => showToast("위치를 확인할 수 없어요. 권한을 허용해 주세요")}
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
            getTransitLegs={getTransitLegs}
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
          routeId={routeId}
          onAdd={handleAdd}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {/* 더보기 메뉴 */}
      {menuOpen && (
        <div className="absolute inset-0 z-[55]" onClick={closeMenu}>
          <div
            className="absolute right-4 top-[48px] w-[214px] rounded-[16px] bg-white shadow-soft overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {renaming ? (
              <div className="p-4">
                <p className="text-[13px] font-semibold text-ink mb-2">
                  루트 이름 변경
                </p>
                <input
                  autoFocus
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  maxLength={100}
                  className="w-full h-9 rounded-lg border border-line px-3 text-[13px] text-ink outline-none focus:border-brand"
                />
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRenaming(false)}
                    className="flex-1 h-9 rounded-full bg-cream text-[12px] font-semibold text-ink cursor-pointer whitespace-nowrap"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={doRename}
                    disabled={!nameDraft.trim()}
                    className="flex-1 h-9 rounded-full bg-ink text-white text-[12px] font-semibold cursor-pointer whitespace-nowrap disabled:opacity-50"
                  >
                    저장
                  </button>
                </div>
              </div>
            ) : confirmClear ? (
              <div className="p-4">
                <p className="text-[13px] font-semibold text-ink">
                  루트를 모두 비울까요?
                </p>
                <p className="text-[11px] text-muted mt-1 leading-relaxed">
                  추가한 스팟이 모두 사라져요.
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="flex-1 h-9 rounded-full bg-cream text-[12px] font-semibold text-ink cursor-pointer whitespace-nowrap"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={doClear}
                    className="flex-1 h-9 rounded-full bg-[#B4453A] text-white text-[12px] font-semibold cursor-pointer whitespace-nowrap"
                  >
                    비우기
                  </button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-[#F5F1EE]">
                {menuItems.map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.label}
                      type="button"
                      onClick={m.onClick}
                      disabled={m.disabled}
                      className={`w-full flex items-center gap-2.5 px-4 h-[46px] text-left cursor-pointer disabled:opacity-40 ${
                        m.danger ? "text-[#B4453A]" : "text-ink"
                      }`}
                    >
                      <Icon
                        size={16}
                        strokeWidth={2}
                        color={m.danger ? "#B4453A" : "#2C1810"}
                      />
                      <span className="text-[13px] font-semibold">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
