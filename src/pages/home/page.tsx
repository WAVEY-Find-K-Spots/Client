import { useEffect, useMemo, useRef, useState } from "react";
import StatusBar from "@/components/layout/StatusBar";
import SpotCard from "./components/SpotCard";
import SpotListItem from "./components/SpotListItem";
import SearchPanel from "./components/SearchPanel";
import FilterSheet, { type SpotFilterState } from "./components/FilterSheet";
import { spotCategories, type SpotType } from "@/mocks/spots";
import { useNotifications } from "@/store/notifications-context";
import { searchSpots, type SpotCategory, type SpotSort } from "@/lib/spots-api";
import { getRegions, type Region } from "@/lib/regions-api";
import { toHomeSpotView, type HomeSpotView } from "./adapters";
import { sortByHasImage } from "@/lib/image-fallback";
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

type CatKey = "all" | SpotType;
type SortKey = "popular" | "rating" | "recent";
type ViewMode = "grid" | "list";
type Overlay = "none" | "sort" | "filter";

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "popular", label: "인기순" },
  { key: "rating", label: "평점순" },
  { key: "recent", label: "최신순" },
];

const catToCategory: Record<Exclude<CatKey, "all">, SpotCategory> = {
  drama: "K_DRAMA",
  kpop: "K_POP",
  movie: "K_MOVIE",
  tour: "K_HERITAGE",
};

const sortToApi: Record<SortKey, SpotSort> = {
  popular: "POPULAR",
  rating: "RATING",
  recent: "LATEST",
};

const recommendedKw = [
  "눈물의 여왕",
  "BTS",
  "경복궁",
  "이태원 클라쓰",
  "한강",
  "킹덤",
  "사랑의 불시착",
];

const defaultFilters: SpotFilterState = {
  regionId: null,
  minRating: 0,
};

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
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [recent, setRecent] = useState<string[]>([
    "경복궁",
    "눈물의 여왕",
    "남산타워",
  ]);
  const [toast, setToast] = useState<string | null>(null);
  const sortPillRef = useRef<HTMLButtonElement>(null);

  const [regions, setRegions] = useState<Region[]>([]);
  const [items, setItems] = useState<HomeSpotView[]>([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const isSearching = focusSearch && !query.trim();
  const isResults = debouncedQuery.trim().length > 0;

  useEffect(() => {
    getRegions()
      .then(setRegions)
      .catch(() => setRegions([]));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  // 검색어/카테고리/필터/정렬이 바뀌면 첫 페이지부터 다시 불러온다
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPage(0);
    const params = isResults
      ? { keyword: debouncedQuery.trim(), page: 0 }
      : {
          category: cat === "all" ? undefined : catToCategory[cat],
          regionId: filters.regionId ?? undefined,
          minRating: filters.minRating || undefined,
          sort: sortToApi[sort],
          page: 0,
        };
    searchSpots(params)
      .then((result) => {
        if (cancelled) return;
        setItems(
          sortByHasImage(result.spots.map(toHomeSpotView), (s) => s.hasImage),
        );
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
  }, [isResults, debouncedQuery, cat, filters.regionId, filters.minRating, sort]);

  const loadMore = () => {
    if (loadingMore || !hasNext) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    const params = isResults
      ? { keyword: debouncedQuery.trim(), page: nextPage }
      : {
          category: cat === "all" ? undefined : catToCategory[cat],
          regionId: filters.regionId ?? undefined,
          minRating: filters.minRating || undefined,
          sort: sortToApi[sort],
          page: nextPage,
        };
    searchSpots(params)
      .then((result) => {
        setItems((prev) => [
          ...prev,
          ...sortByHasImage(result.spots.map(toHomeSpotView), (s) => s.hasImage),
        ]);
        setHasNext(result.hasNext);
        setPage(nextPage);
      })
      .catch(() => setHasNext(false))
      .finally(() => setLoadingMore(false));
  };

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
    const w = kw.trim();
    if (!w) return;
    setRecent((p) => [w, ...p.filter((x) => x !== w)].slice(0, 6));
  };

  const pickKeyword = (kw: string) => {
    setQuery(kw);
    setFocusSearch(false);
    pushRecent(kw);
  };

  const toggleSave = (id: string) => {
    setSaved((p) => {
      const next = new Set(p);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const sortLabel = sortOptions.find((o) => o.key === sort)?.label ?? "인기순";

  const hasActiveFilter =
    cat !== "all" || filters.minRating > 0 || filters.regionId !== null;

  const half = Math.ceil(items.length / 2);
  const leftCol = items.slice(0, half);
  const rightCol = items.slice(half);

  const browseHeaderTitle = useMemo(
    () =>
      cat === "all" ? "인기 스팟" : spotCategories.find((c) => c.key === cat)?.label,
    [cat],
  );

  return (
    <div className="relative min-h-full bg-page">
      <StatusBar variant="dark" />

      {/* Header */}
      <div className="px-5 pt-1 flex items-center justify-between">
        <h1 className="text-[22px] font-extrabold tracking-tight text-ink">
          WAVEY
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
      <div className="px-5 mt-4">
        <div className="flex items-center gap-2">
          <div
            className={`flex-1 flex items-center gap-2.5 bg-white h-[52px] px-4 rounded-[24px] shadow-soft ${
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
                  pushRecent(query);
                  setFocusSearch(false);
                }
              }}
              placeholder="장소명 또는 드라마명 검색"
              className="flex-1 bg-transparent outline-none text-[13px] text-ink placeholder:text-muted"
            />
            {isResults && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setQuery("")}
                className="flex items-center justify-center w-6 h-6 rounded-full bg-cream cursor-pointer"
                aria-label="지우기"
              >
                <X size={14} color="#A8623E" />
              </button>
            )}
          </div>

          {isSearching || isResults ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
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
        <div className="px-5 mt-5 pb-28">
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
                  saved={saved.has(s.id)}
                  onToggleSave={() => toggleSave(s.id)}
                  onOpen={() => navigate?.(`/spot/${s.id}`)}
                />
              ))}
              {hasNext && (
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="mt-1 h-11 rounded-full bg-cream text-ink text-[13px] font-semibold cursor-pointer disabled:opacity-60"
                >
                  {loadingMore ? "불러오는 중..." : "더보기"}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ---------- BROWSE ---------- */}
      {!isSearching && !isResults && (
        <>
          {/* Category chips */}
          <div className="mt-4 px-5 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 w-max">
              {spotCategories.map((c) => {
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
          <div className="mt-3 px-5 flex items-center justify-between">
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
          <div className="mt-6 px-5 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-ink">
              {browseHeaderTitle}
            </h2>
            <span className="text-[12px] text-muted">
              총 {totalElements}곳
            </span>
          </div>

          {/* Cards */}
          <div className="mt-3 px-5 pb-28">
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
                <div className="grid grid-cols-2 gap-3 items-start">
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
                {hasNext && (
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="mt-3 w-full h-11 rounded-full bg-cream text-ink text-[13px] font-semibold cursor-pointer disabled:opacity-60"
                  >
                    {loadingMore ? "불러오는 중..." : "더보기"}
                  </button>
                )}
              </>
            ) : (
              <div className="flex flex-col gap-3">
                {items.map((s) => (
                  <SpotListItem
                    key={s.id}
                    spot={s}
                    saved={saved.has(s.id)}
                    onToggleSave={() => toggleSave(s.id)}
                    onOpen={() => navigate?.(`/spot/${s.id}`)}
                  />
                ))}
                {hasNext && (
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="h-11 rounded-full bg-cream text-ink text-[13px] font-semibold cursor-pointer disabled:opacity-60"
                  >
                    {loadingMore ? "불러오는 중..." : "더보기"}
                  </button>
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
                    setSort(o.key);
                    closeOverlay();
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
