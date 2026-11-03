import { useEffect, useRef, useState } from "react";
import { spotGradientMap } from "@/mocks/spots";
import { searchSpots, type SpotSearchParams } from "@/lib/spots-api";
import { toSpotCandidate, type SpotCandidate } from "@/lib/route-adapters";
import { sortByHasImage } from "@/lib/image-fallback";
import type { SpotCategory } from "@/lib/routes-api";
import { Check, Plus, Search, X } from "lucide-react";

interface SpotPickerProps {
  routeId: number | null;
  /** 추가가 끝나면 시트를 닫아도 되는지 반환한다. false면 선택을 유지한 채 시트를 둔다. */
  onAdd: (spotIds: number[]) => Promise<boolean>;
  onClose: () => void;
}

const CATEGORY_CHIPS: { key: SpotCategory | null; label: string }[] = [
  { key: null, label: "전체" },
  { key: "K_DRAMA", label: "드라마" },
  { key: "K_POP", label: "K-POP" },
  { key: "K_MOVIE", label: "영화" },
  { key: "K_HERITAGE", label: "전통·유산" },
];

const SEARCH_DEBOUNCE_MS = 300;

export default function SpotPicker({ routeId, onAdd, onClose }: SpotPickerProps) {
  const [candidates, setCandidates] = useState<SpotCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState<SpotCategory | null>(null);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  // 검색 조건이 바뀌면 이전 조건의 "더 보기" 응답을 버리기 위한 요청 번호
  const requestRef = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setKeyword(keywordInput.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [keywordInput]);

  const buildParams = (nextPage: number): SpotSearchParams => ({
    ...(routeId ? { excludeRouteId: routeId } : {}),
    ...(keyword ? { keyword } : {}),
    ...(category ? { category } : {}),
    page: nextPage,
  });

  useEffect(() => {
    const requestId = ++requestRef.current;
    setLoading(true);
    setLoadError(false);
    setLoadingMore(false);
    setLoadMoreError(false);
    searchSpots(buildParams(0))
      .then((result) => {
        if (requestId !== requestRef.current) return;
        setCandidates(
          sortByHasImage(result.spots.map(toSpotCandidate), (c) => c.hasImage),
        );
        setPage(result.page);
        setHasNext(result.hasNext);
        listRef.current?.scrollTo({ top: 0 });
      })
      .catch(() => {
        if (requestId !== requestRef.current) return;
        setCandidates([]);
        setHasNext(false);
        setLoadError(true);
      })
      .finally(() => {
        if (requestId === requestRef.current) setLoading(false);
      });
    return () => {
      requestRef.current += 1;
    };
    // buildParams는 아래 의존성 값만 사용한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryKey, routeId, keyword, category]);

  const loadMore = () => {
    if (loadingMore) return;
    const requestId = requestRef.current;
    setLoadingMore(true);
    setLoadMoreError(false);
    searchSpots(buildParams(page + 1))
      .then((result) => {
        if (requestId !== requestRef.current) return;
        const next = sortByHasImage(
          result.spots.map(toSpotCandidate),
          (c) => c.hasImage,
        );
        setCandidates((prev) => {
          const seen = new Set(prev.map((c) => c.id));
          return [...prev, ...next.filter((c) => !seen.has(c.id))];
        });
        setPage(result.page);
        setHasNext(result.hasNext);
      })
      .catch(() => {
        if (requestId === requestRef.current) setLoadMoreError(true);
      })
      .finally(() => {
        if (requestId === requestRef.current) setLoadingMore(false);
      });
  };

  const toggle = (id: string) => {
    setSubmitError(false);
    setSelected((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );
  };

  const close = () => {
    if (!submitting) onClose();
  };

  const confirm = async () => {
    if (selected.length === 0 || submitting) return;
    setSubmitting(true);
    setSubmitError(false);
    const canClose = await onAdd(selected.map(Number));
    if (canClose) {
      onClose();
      return;
    }
    setSubmitting(false);
    setSubmitError(true);
  };

  const emptyMessage = loadError
    ? "스팟을 불러오지 못했어요"
    : keyword || category
      ? "조건에 맞는 스팟이 없어요"
      : "추가할 수 있는 스팟이 없어요";

  return (
    <div className="absolute inset-0 z-[60] flex flex-col justify-end">
      <div className="absolute inset-0 bg-ink/45" onClick={close} />
      <div className="wv-sheet-up relative bg-white rounded-t-[26px] flex flex-col h-[78%] min-h-0">
        {/* handle + title */}
        <div className="flex flex-col items-center pt-3 pb-3 shrink-0">
          <span className="w-10 h-1 rounded-full bg-line" />
          <div className="w-full flex items-center justify-between px-5 mt-3">
            <h3 className="text-[16px] font-bold text-ink">스팟 추가</h3>
            <button
              type="button"
              onClick={close}
              disabled={submitting}
              aria-label="닫기"
              className="text-[13px] font-medium text-muted cursor-pointer disabled:opacity-40"
            >
              취소
            </button>
          </div>
        </div>

        {/* search + category */}
        <div className="px-5 pb-3 shrink-0">
          <div className="flex items-center gap-2 h-10 rounded-[12px] bg-cream px-3">
            <Search size={16} color="#A89890" className="shrink-0" />
            <input
              type="search"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              maxLength={200}
              placeholder="스팟 이름으로 검색"
              aria-label="스팟 검색"
              className="flex-1 min-w-0 bg-transparent text-[13px] text-ink placeholder:text-muted outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {keywordInput && (
              <button
                type="button"
                onClick={() => setKeywordInput("")}
                aria-label="검색어 지우기"
                className="flex items-center justify-center w-5 h-5 shrink-0 cursor-pointer"
              >
                <X size={14} color="#A89890" />
              </button>
            )}
          </div>
          <div className="mt-2.5 -mx-5 px-5 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 w-max">
              {CATEGORY_CHIPS.map((chip) => {
                const active = category === chip.key;
                return (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => setCategory(chip.key)}
                    aria-pressed={active}
                    className={`h-8 rounded-[20px] px-3.5 text-[12px] font-medium cursor-pointer whitespace-nowrap ${
                      active
                        ? "bg-ink text-white"
                        : "bg-white text-muted border border-line"
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* list */}
        <div
          ref={listRef}
          className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-5 pb-2"
        >
          {loading ? (
            <div className="flex flex-col gap-2" aria-label="불러오는 중">
              {Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-[16px] border border-line p-2.5 animate-pulse"
                >
                  <span className="w-12 h-12 rounded-xl shrink-0 bg-cream" />
                  <span className="flex-1 min-w-0">
                    <span className="block h-3.5 w-2/3 rounded bg-cream" />
                    <span className="block h-2.5 w-1/2 rounded bg-cream mt-2" />
                  </span>
                </div>
              ))}
            </div>
          ) : candidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10">
              <p className="text-center text-[13px] text-muted">{emptyMessage}</p>
              {loadError && (
                <button
                  type="button"
                  onClick={() => setRetryKey((key) => key + 1)}
                  className="h-9 rounded-full bg-cream px-4 text-[12px] font-semibold text-brand cursor-pointer"
                >
                  다시 시도
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {candidates.map((s) => {
                const checked = selected.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggle(s.id)}
                    disabled={submitting}
                    aria-pressed={checked}
                    className={`flex items-center gap-3 rounded-[16px] p-2.5 text-left cursor-pointer border disabled:opacity-60 ${
                      checked
                        ? "border-brand bg-cream/50"
                        : "border-line bg-white"
                    }`}
                  >
                    <span
                      className="w-12 h-12 rounded-xl shrink-0 overflow-hidden"
                      style={{ background: spotGradientMap[s.type] ?? "#A8623E" }}
                    >
                      <img
                        src={s.image}
                        alt={s.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block truncate text-[14px] font-semibold text-ink">
                        {s.name}
                      </span>
                      <span className="block truncate text-[11px] text-muted mt-0.5">
                        {s.loc ? `${s.typeLabel} · ${s.loc}` : s.typeLabel}
                      </span>
                    </span>
                    <span
                      className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 ${
                        checked ? "bg-brand" : "bg-cream"
                      }`}
                    >
                      {checked ? (
                        <Check size={13} color="#FFFFFF" strokeWidth={3} />
                      ) : (
                        <Plus size={14} color="#A89890" />
                      )}
                    </span>
                  </button>
                );
              })}
              {hasNext && (
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="mt-1 mb-1 self-center h-9 rounded-full border border-line bg-white px-5 text-[12px] font-medium text-muted cursor-pointer disabled:opacity-60"
                >
                  {loadingMore
                    ? "불러오는 중..."
                    : loadMoreError
                      ? "다시 시도"
                      : "더 보기"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* confirm */}
        <div className="px-5 pb-6 pt-2 shrink-0">
          {submitError && (
            <p role="alert" className="mb-2 text-center text-[12px] text-brand">
              스팟을 추가하지 못했어요. 다시 시도해주세요.
            </p>
          )}
          <button
            type="button"
            onClick={() => void confirm()}
            disabled={selected.length === 0 || submitting}
            className="w-full h-[50px] rounded-full bg-ink text-white text-[14px] font-semibold cursor-pointer whitespace-nowrap disabled:opacity-40"
          >
            {submitting
              ? "추가하는 중..."
              : selected.length > 0
                ? `${selected.length}개 스팟 추가하기`
                : "스팟을 선택해주세요"}
          </button>
        </div>
      </div>
    </div>
  );
}
