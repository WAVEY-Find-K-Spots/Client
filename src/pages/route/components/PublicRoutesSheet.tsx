import { useEffect, useState } from "react";
import {
  getPublicRoutes,
  getRouteDetail,
  type RouteSummary,
  type RouteDetail,
} from "@/lib/routes-api";
import { toRouteStop } from "@/lib/route-adapters";
import RouteMap from "./RouteMap";
import { ChevronLeft, MapPin, X } from "lucide-react";

interface PublicRoutesSheetProps {
  onClose: () => void;
  onOpenSpot: (spotId: string) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export default function PublicRoutesSheet({ onClose, onOpenSpot }: PublicRoutesSheetProps) {
  const [routes, setRoutes] = useState<RouteSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<RouteDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPublicRoutes({ page: 0, size: 20 })
      .then((result) => {
        if (cancelled) return;
        setRoutes(result.content);
        setHasNext(!result.last);
        setPage(0);
      })
      .catch(() => {
        if (!cancelled) setRoutes([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadMore = () => {
    if (loadingMore || !hasNext) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    getPublicRoutes({ page: nextPage, size: 20 })
      .then((result) => {
        setRoutes((prev) => [...prev, ...result.content]);
        setHasNext(!result.last);
        setPage(nextPage);
      })
      .catch(() => setHasNext(false))
      .finally(() => setLoadingMore(false));
  };

  const openDetail = (routeId: number) => {
    setSelectedId(routeId);
    setDetail(null);
    setDetailLoading(true);
    getRouteDetail(routeId)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false));
  };

  return (
    <div className="absolute inset-0 z-[60] flex flex-col justify-end">
      <div className="absolute inset-0 bg-ink/45" onClick={onClose} />
      <div className="relative bg-white rounded-t-[26px] flex flex-col max-h-[88%] min-h-0">
        {/* handle + title */}
        <div className="flex flex-col items-center pt-3 pb-3 shrink-0">
          <span className="w-10 h-1 rounded-full bg-line" />
          <div className="w-full flex items-center justify-between px-5 mt-3">
            {selectedId != null ? (
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="flex items-center gap-1 text-[14px] font-medium text-muted cursor-pointer"
              >
                <ChevronLeft size={18} />
                목록으로
              </button>
            ) : (
              <h3 className="text-[16px] font-bold text-ink">공개 루트 둘러보기</h3>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="flex items-center justify-center w-8 h-8 rounded-full cursor-pointer"
            >
              <X size={18} color="#A89890" />
            </button>
          </div>
        </div>

        {selectedId == null ? (
          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-5 pb-6">
            {loading ? (
              <p className="text-center text-[13px] text-muted py-10">
                불러오는 중...
              </p>
            ) : routes.length === 0 ? (
              <p className="text-center text-[13px] text-muted py-10">
                아직 공개된 루트가 없어요
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {routes.map((r) => (
                  <button
                    key={r.routeId}
                    type="button"
                    onClick={() => openDetail(r.routeId)}
                    className="w-full bg-cream rounded-[16px] p-4 text-left cursor-pointer"
                  >
                    <p className="text-[14px] font-semibold text-ink">{r.name}</p>
                    {r.description && (
                      <p className="mt-1 text-[12px] text-muted line-clamp-1">
                        {r.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-muted">
                      <span className="flex items-center gap-1">
                        <MapPin size={11} color="#A89890" />
                        {r.spotCount}개 스팟
                      </span>
                      <span>{formatDate(r.updatedAt)}</span>
                    </div>
                  </button>
                ))}
                {hasNext && (
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="h-10 rounded-full bg-cream text-ink text-[13px] font-semibold cursor-pointer disabled:opacity-60"
                  >
                    {loadingMore ? "불러오는 중..." : "더보기"}
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
            {detailLoading || !detail ? (
              <p className="text-center text-[13px] text-muted py-10">
                불러오는 중...
              </p>
            ) : (
              <>
                <div className="h-[200px]">
                  <RouteMap
                    variant="plan"
                    stops={detail.spots.map(toRouteStop)}
                  />
                </div>
                <div className="px-5 py-4">
                  <h4 className="text-[16px] font-bold text-ink">{detail.name}</h4>
                  {detail.description && (
                    <p className="mt-1 text-[13px] text-sub leading-relaxed">
                      {detail.description}
                    </p>
                  )}
                  <p className="mt-3 text-[12px] font-semibold text-muted">
                    스팟 {detail.spots.length}개
                  </p>
                  <div className="mt-2 flex flex-col gap-2">
                    {detail.spots.map((s, i) => (
                      <button
                        key={s.routeSpotId}
                        type="button"
                        onClick={() => onOpenSpot(String(s.spotId))}
                        className="flex items-center gap-3 bg-cream rounded-xl p-3 text-left cursor-pointer"
                      >
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-ink text-white text-[11px] font-bold shrink-0">
                          {i + 1}
                        </span>
                        <span className="flex-1 min-w-0 text-[13px] font-medium text-ink truncate">
                          {s.name ?? "삭제된 스팟"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
