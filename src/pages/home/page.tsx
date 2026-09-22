import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import StatusBar from "@/components/layout/StatusBar";
import SpotCard from "./components/SpotCard";
import SpotListItem from "./components/SpotListItem";
import SearchPanel from "./components/SearchPanel";
import FilterSheet, { type SpotFilterState } from "./components/FilterSheet";
import { useNotifications } from "@/store/notifications-context";
import {
  saveSpot,
  unsaveSpot,
  type SpotSort,
} from "@/lib/spots-api";
import { getHomeSpots } from "@/lib/home-page-api";
import { getRegions, type Region } from "@/lib/regions-api";
import { toHomeSpotView, type HomeSpotView } from "./adapters";
import { sortByHasImage } from "@/lib/image-fallback";
import { getCurrentCoords, type LatLng } from "@/lib/geo";
import {
  categoryLabel,
  categoryToApi,
  homeCategories,
  type HomeCategoryKey,
} from "@/lib/spot-categories";
import waveyLogo from "@/assets/wavey-logo.png";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  LayoutGrid,
  List,
  ArrowUpDown,
  Check,
  Bell,
  SearchX,
} from "lucide-react";

type CatKey = HomeCategoryKey;
type SortKey = "popular" | "rating" | "recent" | "distance";
type ViewMode = "grid" | "list";
type Overlay = "none" | "sort" | "filter";

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "popular", label: "인기순" },
  { key: "distance", label: "거리순" },
  { key: "rating", label: "평점순" },
  { key: "recent", label: "최신순" },
];

const sortToApi: Record<SortKey, SpotSort> = {
  popular: "POPULAR",
  rating: "RATING",
  recent: "LATEST",
  distance: "DISTANCE",
};

const recommendedKw = [
  "방탄소년단",
  "경복궁",
  "한강",
  "북촌한옥마을",
  "광화문",
  "이태원",
  "제주",
  "부산",
  "해운대",
  "전주",
];

const defaultFilters: SpotFilterState = {
  regionId: null,
  minRating: 0,
  radiusMeters: null,
};

const defaultRegions: Region[] = [
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

function normalizeSearchKeyword(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function realImagesFirst(items: HomeSpotView[]) {
  return sortByHasImage(items, (s) => s.hasImage);
}

export default function SpotList() {
  const navigate = (
    window as unknown as { REACT_APP_NAVIGATE?: (p: string) => void }
  ).REACT_APP_NAVIGATE;
  const { unreadCount } = useNotifications();

  const [cat, setCat] = useState<CatKey>("all");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [focusSearch, setFocusSearch] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sort, setSort] = useState<SortKey>("popular");
  const [filters, setFilters] = useState<SpotFilterState>(defaultFilters);
  const [overlay, setOverlay] = useState<Overlay>("none");
  const [layer, setLayer] = useState<{ top: number; height: number }>({
    top: 0,
    height: 700,
  });
  const [dropTop, setDropTop] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const sortPillRef = useRef<HTMLButtonElement>(null);

  const [regions, setRegions] = useState<Region[]>([]);
  const [items, setItems] = useState<HomeSpotView[]>([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [coords, setCoords] = useState<LatLng | null>(null);

  const isSearching = focusSearch && !query.trim();
  const isResults = debouncedQuery.trim().length > 0;

  useEffect(() => {
    getRegions()
      .then((result) => setRegions(result.length > 0 ? result : defaultRegions))
      .catch(() => setRegions(defaultRegions));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if ((sort !== "distance" && !filters.radiusMeters) || coords) return;
    let cancelled = false;
    getCurrentCoords()
      .then((current) => {
        if (!cancelled) setCoords(current);
      })
      .catch(() => {
        if (cancelled) return;
        setSort("popular");
        setFilters((current) => ({ ...current, radiusMeters: null }));
        showToast("위치 권한이 필요해요");
      });
    return () => {
      cancelled = true;
    };
  }, [coords, filters.radiusMeters, sort]);

  const buildSearchParams = useCallback(
    (targetPage: number) => {
      const keyword = normalizeSearchKeyword(debouncedQuery);
      if (isResults) {
        return { keyword, page: targetPage };
      }

      return {
        category: categoryToApi(cat),
        regionId: filters.regionId ?? undefined,
        minRating: filters.minRating || undefined,
        radiusMeters: filters.radiusMeters ?? undefined,
        sort: sortToApi[sort],
        latitude: sort === "distance" || filters.radiusMeters ? coords?.lat : undefined,
        longitude: sort === "distance" || filters.radiusMeters ? coords?.lng : undefined,
        page: targetPage,
      };
    },
    [
      cat,
      coords?.lat,
      coords?.lng,
      debouncedQuery,
      filters.minRating,
      filters.radiusMeters,
      filters.regionId,
      isResults,
      sort,
    ],
  );

  // 검색어/카테고리/필터/정렬이 바뀌면 첫 페이지부터 다시 불러온다
  useEffect(() => {
    if ((sort === "distance" || filters.radiusMeters) && !coords) return;
    let cancelled = false;
    setLoading(true);
    setPage(0);
    getHomeSpots(buildSearchParams(0))
      .then((result) => {
        if (cancelled) return;
        setItems(realImagesFirst(result.spots.map(toHomeSpotView)));
        setHasNext(result.hasNext);
        setTotalElements(result.totalElements);
      })
      .catch(() => {
        if (cancelled) return;
        setItems([]);
        setHasNext(false);
        setTotalElements(0);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [buildSearchParams, coords, filters.radiusMeters, sort]);

  const loadMore = () => {
    if (loadingMore || !hasNext) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    getHomeSpots(buildSearchParams(nextPage))
      .then((result) => {
        setItems((prev) => realImagesFirst([...prev, ...result.spots.map(toHomeSpotView)]));
        setHasNext(result.hasNext);
        setPage(nextPage);
      })
      .catch(() => setHasNext(false))
      .finally(() => setLoadingMore(false));
  };

  const selectSort = (nextSort: SortKey) => {
    if (nextSort === "distance" && !coords) {
      getCurrentCoords()
        .then((current) => {
          setCoords(current);
          setSort(nextSort);
        })
        .catch(() => showToast("위치 권한이 필요해요"));
      closeOverlay();
      return;
    }
    setSort(nextSort);
    closeOverlay();
  };

  // 무한 스크롤: 리스트 맨 아래 sentinel이 보이면 다음 페이지를 불러온다
  const loadMoreRef = useRef(loadMore);
  loadMoreRef.current = loadMore;
  const observerRef = useRef<IntersectionObserver | null>(null);
  const setSentinelRef = useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!node) return;
    const root = document.getElementById("app-scroll");
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMoreRef.current();
      },
      { root, rootMargin: "200px" },
    );
    observer.observe(node);
    observerRef.current = observer;
  }, []);

  const lockScroll = (on: boolean) => {
    const el = document.getElementById("app-scroll");
    if (el) el.style.overflow = on ? "hidden" : "";
  };

  const openFilter = () => {
    const el = document.getElementById("app-scroll");
    lockScroll(true);
    if (el) setLayer({ top: el.scrollTop, height: el.clientHeight });
    setOverlay("filter");
  };

  const openSort = () => {
    const el = document.getElementById("app-scroll");
    lockScroll(true);
    if (el) {
      setLayer({ top: el.scrollTop, height: el.clientHeight });
      if (sortPillRef.current) {
        const areaRect = el.getBoundingClientRect();
        setDropTop(
          sortPillRef.current.getBoundingClientRect().top - areaRect.top
        );
      }
    }
    setOverlay("sort");
  };

  const closeOverlay = () => {
    lockScroll(false);
    setOverlay("none");
  };

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1600);
  };

  const pushRecent = (kw: string) => {
    const w = normalizeSearchKeyword(kw);
    if (!w) return;
    setRecent((p) => [w, ...p.filter((x) => x !== w)].slice(0, 6));
  };

  const pickKeyword = (kw: string) => {
    const next = normalizeSearchKeyword(kw);
    setQuery(next);
    setDebouncedQuery(next);
    setFocusSearch(false);
    pushRecent(next);
  };

  const toggleSave = async (id: string) => {
    const spotId = Number(id);
    const current = items.find((s) => s.id === id);
    if (!current) return;
    const next = !current.saved;
    setItems((prev) =>
      prev.map((s) => (s.id === id ? { ...s, saved: next } : s)),
    );
    try {
      const result = next ? await saveSpot(spotId) : await unsaveSpot(spotId);
      setItems((prev) =>
        prev.map((s) => (s.id === id ? { ...s, saved: result.saved } : s)),
      );
    } catch {
      setItems((prev) =>
        prev.map((s) => (s.id === id ? { ...s, saved: !next } : s)),
      );
      showToast(next ? "찜하지 못했어요" : "찜을 해제하지 못했어요");
    }
  };

  const sortLabel = sortOptions.find((o) => o.key === sort)?.label ?? "인기순";

  const hasActiveFilter =
    cat !== "all" ||
    filters.minRating > 0 ||
    filters.regionId !== null ||
    filters.radiusMeters !== null;

  const half = Math.ceil(items.length / 2);
  const leftCol = items.slice(0, half);
  const rightCol = items.slice(half);

  const browseHeaderTitle = useMemo(
    () => (cat === "all" ? "전체" : categoryLabel(cat)),
    [cat],
  );

  return (
    <div className="relative min-h-full bg-page">
      <StatusBar variant="dark" />

      {/* Header */}
      <div className="px-4 sm:px-5 pt-1 flex items-center justify-between">
        <h1 className="h-10 flex items-center">
          <img
            src={waveyLogo}
            alt="WAVEY"
            className="h-8 w-auto max-w-[132px] object-contain"
          />
        </h1>
        <button
          type="button"
          onClick={() => navigate?.("/notifications")}
          className="relative flex items-center justify-center w-10 h-10 rounded-[14px] bg-cream cursor-pointer"
          aria-label="알림"
        >
          <span className="flex items-center justify-center w-5 h-5">
            <Bell size={19} color="#A8623E" strokeWidth={2} />
          </span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-brand text-white text-[9px] font-bold flex items-center justify-center border-2 border-cream">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Search bar */}
      <div className="px-4 sm:px-5 mt-4">
        <div className="flex items-center gap-2">
          <div
            className={`flex-1 min-w-0 flex items-center gap-2.5 bg-white h-[52px] px-4 rounded-[24px] shadow-soft ${
              isSearching || isResults
                ? "border-2 border-brand"
                : "border border-cta"
            }`}
          >
            <span className="flex items-center justify-center w-4 h-4">
              <Search size={18} color="#A8623E" strokeWidth={2} />
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocusSearch(true)}
              onBlur={() => setFocusSearch(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const next = normalizeSearchKeyword(query);
                  setQuery(next);
                  setDebouncedQuery(next);
                  pushRecent(next);
                  setFocusSearch(false);
                }
              }}
              placeholder="장소명 또는 드라마명 검색"
              className="flex-1 min-w-0 bg-transparent outline-none text-[13px] text-ink placeholder:text-muted"
            />
          </div>

          {isSearching || isResults ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setDebouncedQuery("");
                setFocusSearch(false);
              }}
              className="shrink-0 flex items-center justify-center w-[52px] h-[52px] rounded-[18px] bg-cream cursor-pointer"
              aria-label="검색 닫기"
            >
              <X size={22} color="#2C1810" strokeWidth={2.2} />
            </button>
          ) : (
            <button
              type="button"
              onClick={openFilter}
              className="shrink-0 flex items-center justify-center w-[52px] h-[52px] rounded-[18px] bg-ink cursor-pointer relative"
              aria-label="상세 필터"
            >
              <SlidersHorizontal size={20} color="#F7EBE0" strokeWidth={2} />
              {hasActiveFilter && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-brand border-2 border-white" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* ---------- SEARCH SUGGESTIONS ---------- */}
      {isSearching && (
        <div className="mt-5">
          <SearchPanel
            recommended={recommendedKw}
            recent={recent}
            onPick={pickKeyword}
            onRemoveRecent={(kw) =>
              setRecent((p) => p.filter((x) => x !== kw))
            }
            onClearRecent={() => setRecent([])}
          />
        </div>
      )}

      {/* ---------- SEARCH RESULTS ---------- */}
      {isResults && (
        <div className="px-4 sm:px-5 mt-5 pb-[var(--app-page-end-space)]">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-ink">
              {debouncedQuery.trim()} 검색 결과
            </h2>
            <span className="text-[12px] text-muted">{totalElements}개</span>
          </div>

          {!loading && items.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center gap-4">
              <span className="flex items-center justify-center w-16 h-16 rounded-full bg-cream">
                <SearchX size={30} color="#DDD4CE" strokeWidth={1.8} />
              </span>
              <div className="text-center">
                <p className="text-[16px] font-semibold text-ink">
                  검색 결과가 없어요
                </p>
                <p className="text-[13px] text-muted mt-1">
                  다른 키워드로 검색해 보세요
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setDebouncedQuery("");
                  setFocusSearch(false);
                }}
                className="mt-1 px-5 h-11 rounded-full bg-cream text-brand text-[13px] font-semibold cursor-pointer whitespace-nowrap"
              >
                추천 스팟 보기
              </button>
            </div>
          ) : (
            <div className="mt-3 flex flex-col gap-3">
              {items.map((s) => (
                <SpotListItem
                  key={s.id}
                  spot={s}
                  query={debouncedQuery}
                  saved={s.saved}
                  onToggleSave={() => void toggleSave(s.id)}
                  onOpen={() => navigate?.(`/spot/${s.id}`)}
                />
              ))}
              {hasNext && <div ref={setSentinelRef} className="h-1" />}
              {loadingMore && (
                <p className="text-center text-[12px] text-muted py-2">
                  불러오는 중...
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ---------- BROWSE ---------- */}
      {!isSearching && !isResults && (
        <>
          {/* Category chips */}
          <div className="mt-4 px-4 sm:px-5 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 w-max">
              {homeCategories.map((c) => {
                const isActive = cat === c.key;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setCat(c.key)}
                    className={`px-3.5 h-9 rounded-full text-[12px] font-medium cursor-pointer whitespace-nowrap ${
                      isActive
                        ? "bg-ink text-white"
                        : "bg-white text-muted border border-line"
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort + view bar */}
          <div className="mt-3 px-4 sm:px-5 flex items-center justify-between">
            <button
              ref={sortPillRef}
              type="button"
              onClick={openSort}
              className="flex items-center gap-1.5 h-9 px-3 rounded-full bg-cream cursor-pointer"
              aria-label="정렬"
            >
              <span className="flex items-center justify-center w-3.5 h-3.5">
                <ArrowUpDown size={14} color="#2C1810" strokeWidth={2} />
              </span>
              <span className="text-[12px] font-medium text-ink whitespace-nowrap">
                {sortLabel}
              </span>
              <span className="flex items-center justify-center w-3.5 h-3.5">
                <ChevronDown size={13} color="#A89890" strokeWidth={2.2} />
              </span>
            </button>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex items-center justify-center w-9 h-9 rounded-[10px] cursor-pointer ${
                  viewMode === "grid" ? "bg-ink" : "bg-cream"
                }`}
                aria-label="그리드 뷰"
              >
                <LayoutGrid
                  size={17}
                  color={viewMode === "grid" ? "#FFFFFF" : "#A89890"}
                />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`flex items-center justify-center w-9 h-9 rounded-[10px] cursor-pointer ${
                  viewMode === "list" ? "bg-ink" : "bg-cream"
                }`}
                aria-label="리스트 뷰"
              >
                <List
                  size={18}
                  color={viewMode === "list" ? "#FFFFFF" : "#A89890"}
                />
              </button>
            </div>
          </div>

          {/* Section header */}
          <div className="mt-6 px-4 sm:px-5 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-ink">
              {browseHeaderTitle}
            </h2>
            <span className="text-[12px] text-muted">
              총 {totalElements}곳
            </span>
          </div>

          {/* Cards */}
          <div className="mt-3 px-4 sm:px-5 pb-[var(--app-page-end-space)]">
            {!loading && items.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center gap-4">
                <span className="flex items-center justify-center w-16 h-16 rounded-full bg-cream">
                  <SearchX size={30} color="#DDD4CE" strokeWidth={1.8} />
                </span>
                <div className="text-center">
                  <p className="text-[16px] font-semibold text-ink">
                    조건에 맞는 스팟이 없어요
                  </p>
                  <p className="text-[13px] text-muted mt-1">
                    필터를 조정해 보세요
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                  setFilters(defaultFilters);
                  setCat("all");
                  }}
                  className="mt-1 px-5 h-11 rounded-full bg-cream text-brand text-[13px] font-semibold cursor-pointer whitespace-nowrap"
                >
                  필터 초기화
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <>
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3 items-start">
                  <div className="flex flex-col gap-3">
                    {leftCol.map((s) => (
                      <SpotCard
                        key={s.id}
                        spot={s}
                        onOpen={(id) => navigate?.(`/spot/${id}`)}
                      />
                    ))}
                  </div>
                  <div className="flex flex-col gap-3">
                    {rightCol.map((s) => (
                      <SpotCard
                        key={s.id}
                        spot={s}
                        onOpen={(id) => navigate?.(`/spot/${id}`)}
                      />
                    ))}
                  </div>
                </div>
                {hasNext && <div ref={setSentinelRef} className="h-1" />}
                {loadingMore && (
                  <p className="text-center text-[12px] text-muted py-2">
                    불러오는 중...
                  </p>
                )}
              </>
            ) : (
              <div className="flex flex-col gap-3">
                {items.map((s) => (
                  <SpotListItem
                    key={s.id}
                    spot={s}
                    saved={s.saved}
                    onToggleSave={() => void toggleSave(s.id)}
                    onOpen={() => navigate?.(`/spot/${s.id}`)}
                  />
                ))}
                {hasNext && <div ref={setSentinelRef} className="h-1" />}
                {loadingMore && (
                  <p className="text-center text-[12px] text-muted py-2">
                    불러오는 중...
                  </p>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* toast */}
      {toast && (
        <div className="absolute left-1/2 -translate-x-1/2 top-[64px] px-4 py-2.5 rounded-full bg-ink text-white text-[12px] shadow-soft z-[60] whitespace-nowrap">
          {toast}
        </div>
      )}

      {/* ---------- SORT OVERLAY ---------- */}
      {overlay === "sort" && (
        <div
          className="absolute inset-x-0 z-50"
          style={{ top: layer.top, height: layer.height }}
        >
          <div
            className="absolute inset-0 bg-ink/25"
            onClick={closeOverlay}
          />
          <div
            className="absolute left-4 w-[170px] rounded-[16px] bg-white p-2 shadow-soft"
            style={{ top: dropTop + 10 }}
          >
            {sortOptions.map((o, i) => {
              const isSel = sort === o.key;
              return (
                <button
                  key={o.key}
                  type="button"
                  onClick={() => {
                    selectSort(o.key);
                  }}
                  className={`flex items-center justify-between w-full px-3 h-12 text-left cursor-pointer ${
                    i > 0 ? "border-t border-[#F5F1EE]" : ""
                  }`}
                >
                  <span
                    className={`text-[13px] ${
                      isSel ? "font-semibold text-brand" : "text-ink"
                    }`}
                  >
                    {o.label}
                  </span>
                  {isSel && (
                    <span className="flex items-center justify-center w-3.5 h-3.5">
                      <Check size={15} color="#A8623E" strokeWidth={2.4} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------- FILTER SHEET OVERLAY ---------- */}
      {overlay === "filter" && (
        <div
          className="absolute inset-x-0 z-50"
          style={{ top: layer.top, height: layer.height }}
        >
          <div className="absolute inset-0 bg-black/40" onClick={closeOverlay} />
          <div className="absolute inset-x-0 bottom-0">
            <FilterSheet
              filters={filters}
              regions={regions}
              type={cat}
              onTypeChange={(t) => setCat(t as CatKey)}
              onChange={(p) => setFilters((f) => ({ ...f, ...p }))}
              onReset={() => {
                setFilters(defaultFilters);
                setCat("all");
              }}
              onApply={() => {
                closeOverlay();
                showToast("필터가 적용되었어요");
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
