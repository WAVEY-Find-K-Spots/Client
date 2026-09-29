import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import StatusBar from "@/components/layout/StatusBar";
import RouteMap from "./components/RouteMap";
import PlanSheet, { type TransportMode } from "./components/PlanSheet";
import NavOverlay, { MINI_COLLAPSED, MINI_EXPANDED } from "./components/NavOverlay";
import SpotPicker from "./components/SpotPicker";
import PublicRoutesSheet from "./components/PublicRoutesSheet";
import TransitOptionsSheet from "./components/TransitOptionsSheet";
import { useRoute } from "@/store/route-context";
import { getDirections, type DirectionsResult, type TransportMode as ApiTransportMode } from "@/lib/routes-api";
import { formatDistance, formatDuration, getSegmentOptions, toMinutes } from "@/lib/transit-options";
import {
  Plus,
  MoreHorizontal,
  Map,
  Check,
  Repeat,
  Share2,
  Trash2,
  Pencil,
  Compass,
  Globe,
  Lock,
  Crosshair,
} from "lucide-react";

type RouteMode = "empty" | "plan" | "nav";

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
    routeVisibility,
    stops,
    loading: routeLoading,
    addToRoute,
    removeFromRoute,
    reorderRoute,
    clearRoute,
    renameRoute,
    toggleRouteVisibility,
  } = useRoute();
  const [mode, setMode] = useState<RouteMode>("empty");
  const [modeInitialized, setModeInitialized] = useState(false);
  const [transport, setTransport] = useState<TransportMode>("transit");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [publicRoutesOpen, setPublicRoutesOpen] = useState(false);
  const [publicRoutesLayer, setPublicRoutesLayer] = useState({ top: 0, height: 0 });
  const [navSheetExpanded, setNavSheetExpanded] = useState(true);
  const [planSheetExpanded, setPlanSheetExpanded] = useState(false);
  const [locateSignal, setLocateSignal] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [directions, setDirections] = useState<DirectionsResult | null>(null);
  const [directionsLoading, setDirectionsLoading] = useState(false);
  /** 구간 index → 사용자가 고른 대중교통 경로 후보 index (없으면 0번 추천 경로) */
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  const [optionsSheetIndex, setOptionsSheetIndex] = useState<number | null>(null);

  const closeMenu = () => {
    setMenuOpen(false);
    setConfirmClear(false);
    setRenaming(false);
  };

  // 공개 루트 시트가 뒤 배경 스크롤에 밀려나지 않도록, 현재 보이는 영역을
  // 픽셀 단위로 측정해서 고정하고 스크롤을 잠근다
  const openPublicRoutes = () => {
    const el = document.getElementById("app-scroll");
    if (el) {
      setPublicRoutesLayer({ top: el.scrollTop, height: el.clientHeight });
      el.style.overflow = "hidden";
    }
    setPublicRoutesOpen(true);
  };

  const closePublicRoutes = () => {
    const el = document.getElementById("app-scroll");
    if (el) el.style.overflow = "";
    setPublicRoutesOpen(false);
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
  // 편집 ↔ 탐색 전환만으로는 다시 계산하지 않도록(고른 경로 후보 유지) 두 화면을 하나로 묶고,
  // 순서가 바뀌면 다시 계산하도록 스팟 구성을 키로 쓴다
  const directionsActive = mode === "plan" || mode === "nav";
  const stopsKey = stops.map((s) => s.id).join(",");
  useEffect(() => {
    const resetDirections = (result: DirectionsResult | null) => {
      setDirections(result);
      setSelectedOptions({});
      setOptionsSheetIndex(null);
    };

    if (routeId === null || stopsKey.split(",").length < 2 || !directionsActive) {
      resetDirections(null);
      return;
    }

    // 순서 변경은 낙관적으로 먼저 반영되므로, 드래그가 끝나고 서버 저장이 따라올 시간을 둔 뒤 요청하고
    // 응답 구간 순서가 화면과 다르면(아직 저장 전) 한 번 더 요청한다
    const matchesStops = (result: DirectionsResult) =>
      result.segments.map((segment) => String(segment.fromRouteSpotId)).join(",") ===
      stopsKey.split(",").slice(0, -1).join(",");
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    let cancelled = false;
    setDirectionsLoading(true);
    void (async () => {
      try {
        await wait(300);
        if (cancelled) return;
        let result = await getDirections(routeId, transportToApi[transport]);
        if (!cancelled && !matchesStops(result)) {
          await wait(800);
          if (cancelled) return;
          result = await getDirections(routeId, transportToApi[transport]);
        }
        if (!cancelled) resetDirections(result);
      } catch {
        if (!cancelled) resetDirections(null);
      } finally {
        if (!cancelled) setDirectionsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [routeId, stopsKey, transport, directionsActive]);

  const getOptions = (index: number) =>
    transport === "transit" ? getSegmentOptions(directions?.segments[index]) : [];

  /** 추천(0번)이 아닌 후보를 고른 구간이면 그 후보, 아니면 null */
  const getCustomOption = (index: number) => {
    const optionIndex = selectedOptions[index] ?? 0;
    return optionIndex > 0 ? getOptions(index)[optionIndex] ?? null : null;
  };

  const travelToNext = (index: number): string => {
    const segment = directions?.segments[index];
    const custom = getCustomOption(index);
    if (custom) return `대중교통 ${toMinutes(custom.durationSeconds)}분`;
    return segment?.durationText ?? travelFallback[transport];
  };

  const getTransitLegs = (index: number) =>
    getCustomOption(index)?.legs ?? directions?.segments[index]?.transitLegs ?? [];

  const getOptionCount = (index: number) => getOptions(index).length;

  const getSelectedOption = (index: number) => {
    const options = getOptions(index);
    return options[selectedOptions[index] ?? 0] ?? options[0];
  };

  // 다른 후보를 고른 구간이 있으면 지도 경로선과 합계를 선택한 후보 기준으로 다시 계산
  const selection = useMemo(() => {
    if (!directions || transport !== "transit") return null;
    const picked = directions.segments.map((segment, i) => {
      const optionIndex = selectedOptions[i] ?? 0;
      return optionIndex > 0 ? getSegmentOptions(segment)[optionIndex] ?? null : null;
    });
    if (picked.every((option) => option === null)) return null;

    let durationSeconds = 0;
    let distanceMeters = 0;
    const coordinates: [number, number][] = [];
    directions.segments.forEach((segment, i) => {
      const source = picked[i] ?? segment;
      durationSeconds += source.durationSeconds;
      distanceMeters += source.distanceMeters;
      coordinates.push(...source.geometry.coordinates);
    });
    return {
      coordinates,
      durationText: `약 ${formatDuration(durationSeconds)}`,
      distanceText: formatDistance(distanceMeters),
    };
  }, [directions, transport, selectedOptions]);

  const routeGeometry = selection?.coordinates ?? directions?.geometry.coordinates;
  const summaryDuration = selection?.durationText ?? directions?.total.durationText;
  const summaryDistance = selection?.distanceText ?? directions?.total.distanceText;

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

  const handleToggleVisibility = () => {
    const willBePublic = routeVisibility !== "PUBLIC";
    void toggleRouteVisibility().then((ok) => {
      showToast(
        ok
          ? willBePublic
            ? "루트를 공개로 전환했어요"
            : "루트를 비공개로 전환했어요"
          : "공개 설정을 변경하지 못했어요",
      );
    });
    closeMenu();
  };

  const menuItems = [
    {
      icon: Pencil,
      label: "이름 변경",
      onClick: openRename,
      disabled: routeId === null,
    },
    {
      icon: routeVisibility === "PUBLIC" ? Lock : Globe,
      label: routeVisibility === "PUBLIC" ? "비공개로 전환" : "공개로 전환",
      onClick: handleToggleVisibility,
      disabled: routeId === null,
    },
    {
      icon: Compass,
      label: "공개 루트 둘러보기",
      onClick: () => {
        closeMenu();
        openPublicRoutes();
      },
      disabled: false,
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
      <div className="relative h-full flex flex-col overflow-hidden pb-[var(--app-bottom-reserve)] bg-page">
        <StatusBar variant="dark" />
        <div className="flex-1 flex items-center justify-center">
          <span className="w-8 h-8 rounded-full border-2 border-line border-t-brand animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col overflow-hidden pb-[var(--app-bottom-reserve)] bg-page">
      <StatusBar variant="dark" />

      {mode === "empty" && (
        <>
          {renderHeader(
            <>
              <button
                type="button"
                onClick={openPublicRoutes}
                aria-label="공개 루트 둘러보기"
                className="flex items-center justify-center w-9 h-9 rounded-2xl bg-cream cursor-pointer whitespace-nowrap"
              >
                <Compass size={18} color="#A8623E" />
              </button>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                aria-label="새 루트 추가"
                className="flex items-center justify-center w-9 h-9 rounded-2xl bg-ink cursor-pointer whitespace-nowrap"
              >
                <Plus size={18} color="#F7EBE0" />
              </button>
            </>
          )}
          <div className="relative flex-1 min-h-0">
            <RouteMap
              variant="empty"
              stops={stops}
              showLocateControl={false}
              locateSignal={locateSignal}
            />
          </div>
          {/* bottom empty guide card */}
          <div className="absolute left-0 right-0 bottom-0 z-30 bg-white rounded-t-[24px] px-6 pt-8 pb-6 flex flex-col items-center text-center shadow-soft">
            <button
              type="button"
              onClick={() => setLocateSignal((value) => value + 1)}
              aria-label="내 위치로 이동"
              className="absolute right-3 -top-12 z-40 flex items-center justify-center w-9 h-9 rounded-full bg-white cursor-pointer whitespace-nowrap"
              style={{ boxShadow: "0 8px 18px rgba(44,24,16,0.16)" }}
            >
              <Crosshair size={17} color="#2C1810" strokeWidth={1.9} />
            </button>
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
            <button
              type="button"
              onClick={openPublicRoutes}
              className="mt-2.5 w-full h-[52px] rounded-full bg-cream text-brand text-[14px] font-semibold cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5"
            >
              <Compass size={17} />
              다른 사람들의 공개 루트 둘러보기
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
          <div className="h-[60%] shrink-0">
            <RouteMap
              variant="plan"
              stops={stops}
              routeGeometry={routeGeometry}
              showLocateControl={false}
              locateSignal={locateSignal}
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
            getOptionCount={getOptionCount}
            getSelectedOption={getSelectedOption}
            onSegmentClick={setOptionsSheetIndex}
            summaryDuration={directionsLoading ? "계산 중..." : summaryDuration}
            summaryDistance={directionsLoading ? undefined : summaryDistance}
            onExpandChange={setPlanSheetExpanded}
          />
          <button
            type="button"
            onClick={() => setLocateSignal((value) => value + 1)}
            aria-label="내 위치로 이동"
            className="absolute right-3 z-40 flex items-center justify-center w-9 h-9 rounded-full bg-white cursor-pointer whitespace-nowrap"
            style={{
              bottom: planSheetExpanded ? "548px" : "328px",
              boxShadow: "0 8px 18px rgba(44,24,16,0.16)",
            }}
          >
            <Crosshair size={17} color="#2C1810" strokeWidth={1.9} />
          </button>
        </>
      )}

      {mode === "nav" && (
        <div className="relative flex-1 min-h-0">
          <RouteMap
            variant="nav"
            stops={stops}
            currentIndex={current}
            routeGeometry={routeGeometry}
            onLocate={() => showToast("현재 위치로 이동했어요")}
            onLocateError={() => showToast("위치를 확인할 수 없어요. 권한을 허용해 주세요")}
            bottomInset={navSheetExpanded ? MINI_EXPANDED : MINI_COLLAPSED}
          />
          <NavOverlay
            stops={stops}
            current={current}
            onExpandChange={setNavSheetExpanded}
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
            getOptionCount={getOptionCount}
            onSegmentClick={setOptionsSheetIndex}
          />
        </div>
      )}

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

      {optionsSheetIndex !== null && stops[optionsSheetIndex + 1] && (
        <TransitOptionsSheet
          fromName={stops[optionsSheetIndex].name}
          toName={stops[optionsSheetIndex + 1].name}
          options={getOptions(optionsSheetIndex)}
          selectedIndex={selectedOptions[optionsSheetIndex] ?? 0}
          onSelect={(optionIndex) => {
            setSelectedOptions((prev) => ({ ...prev, [optionsSheetIndex]: optionIndex }));
            showToast("선택한 경로로 바꿨어요");
          }}
          onClose={() => setOptionsSheetIndex(null)}
        />
      )}

      {publicRoutesOpen && (
        <PublicRoutesSheet
          onClose={closePublicRoutes}
          onOpenSpot={(spotId) => navigate?.(`/spot/${spotId}`)}
          layer={publicRoutesLayer}
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
