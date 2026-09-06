import { useMemo, useRef, useState } from "react";
import StatusBar from "@/components/layout/StatusBar";
import SpotCard from "./components/SpotCard";
import SpotListItem from "./components/SpotListItem";
import SearchPanel from "./components/SearchPanel";
import FilterSheet, { type SpotFilterState } from "./components/FilterSheet";
import { spots, spotCategories, type SpotType } from "@/mocks/spots";
import { useNotifications } from "@/store/notifications-context";
import { getDistanceKm } from "./distance";
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
type SortKey = "popular" | "rating" | "recent" | "distance";
type ViewMode = "grid" | "list";
type Overlay = "none" | "sort" | "filter";

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "popular", label: "인기순" },
  { key: "rating", label: "평점순" },
  { key: "recent", label: "최신순" },
  { key: "distance", label: "거리순" },
];

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
  region: "서울",
  type: "all",
  minRating: 0,
  distance: 0,
};

export default function SpotList() {
  const navigate = (
    window as unknown as { REACT_APP_NAVIGATE?: (p: string) => void }
  ).REACT_APP_NAVIGATE;
  const { unreadCount } = useNotifications();

  const [cat, setCat] = useState<CatKey>("all");
  const [query, setQuery] = useState("");
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

  const isSearching = focusSearch && !query.trim();
  const isResults = query.trim().length > 0;

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
    filters.type !== "all" ||
    filters.minRating > 0 ||
    filters.distance > 0 ||
    filters.region !== defaultFilters.region;

  const browseList = useMemo(() => {
    let list = cat === "all" ? [...spots] : spots.filter((s) => s.type === cat);
    if (filters.region && filters.region !== "전체") {
      list = list.filter((s) => s.loc.includes(filters.region));
    }
    if (filters.type !== "all") {
      list = list.filter((s) => s.type === filters.type);
    }
    if (filters.minRating > 0) {
      list = list.filter((s) => s.rating >= filters.minRating);
    }
    if (filters.distance > 0) {
      list = list.filter((s) => getDistanceKm(s) <= filters.distance);
    }
    if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    else if (sort === "distance")
      list.sort((a, b) => getDistanceKm(a) - getDistanceKm(b));
    else if (sort === "recent") list.reverse();
    return list;
  }, [cat, filters, sort]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return spots.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.desc.toLowerCase().includes(q) ||
        s.loc.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [query]);

  const half = Math.ceil(browseList.length / 2);
  const leftCol = browseList.slice(0, half);
  const rightCol = browseList.slice(half);

  const browseHeaderTitle =
    cat === "all" ? "인기 스팟" : spotCategories.find((c) => c.key === cat)?.label;

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
              {query.trim()} 검색 결과
            </h2>
            <span className="text-[12px] text-muted">{results.length}개</span>
          </div>

          {results.length === 0 ? (
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
              {results.map((s) => (
                <SpotListItem
                  key={s.id}
                  spot={s}
                  query={query}
                  saved={saved.has(s.id)}
                  onToggleSave={() => toggleSave(s.id)}
                  onOpen={() => navigate?.(`/spot/${s.id}`)}
                />
              ))}
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
              총 {browseList.length}곳
            </span>
          </div>

          {/* Cards */}
          <div className="mt-3 px-5 pb-28">
            {browseList.length === 0 ? (
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
            ) : (
              <div className="flex flex-col gap-3">
                {browseList.map((s) => (
                  <SpotListItem
                    key={s.id}
                    spot={s}
                    saved={saved.has(s.id)}
                    onToggleSave={() => toggleSave(s.id)}
                    onOpen={() => navigate?.(`/spot/${s.id}`)}
                  />
                ))}
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
              onChange={(p) => setFilters((f) => ({ ...f, ...p }))}
              onReset={() => setFilters(defaultFilters)}
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