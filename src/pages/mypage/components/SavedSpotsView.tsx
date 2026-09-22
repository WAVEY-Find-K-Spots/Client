import { useEffect, useState } from "react";
import StatusBar from "@/components/layout/StatusBar";
import SubHeader from "./SubHeader";
import { searchSpots, unsaveSpot } from "@/lib/spots-api";
import { toHomeSpotView, type HomeSpotView } from "@/pages/home/adapters";
import { Heart, Star } from "lucide-react";

interface SavedSpotsViewProps {
  onBack: () => void;
  onOpenSpot: (spotId: string) => void;
}

export default function SavedSpotsView({ onBack, onOpenSpot }: SavedSpotsViewProps) {
  const [spots, setSpots] = useState<HomeSpotView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    searchSpots({ savedOnly: true, page: 0 })
      .then((result) => {
        if (cancelled) return;
        setSpots(result.spots.map(toHomeSpotView));
        setHasNext(result.hasNext);
        setPage(0);
      })
      .catch(() => {
        if (!cancelled) setError("저장한 스팟을 불러오지 못했어요.");
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
    searchSpots({ savedOnly: true, page: nextPage })
      .then((result) => {
        setSpots((prev) => [...prev, ...result.spots.map(toHomeSpotView)]);
        setHasNext(result.hasNext);
        setPage(nextPage);
      })
      .catch(() => setHasNext(false))
      .finally(() => setLoadingMore(false));
  };

  const unsave = async (id: string) => {
    setSpots((prev) => prev.filter((s) => s.id !== id));
    try {
      await unsaveSpot(Number(id));
    } catch {
      setError("찜을 해제하지 못했어요.");
    }
  };

  return (
    <div className="min-h-full bg-page">
      <StatusBar variant="dark" />
      <SubHeader
        title="저장한 스팟"
        onBack={onBack}
        right={<span className="text-[13px] font-medium text-muted">{spots.length}개</span>}
      />

      <div className="px-5 mt-4 flex flex-col gap-3">
        {loading && (
          <p className="text-center text-[13px] text-muted py-10">불러오는 중...</p>
        )}
        {!loading && error && (
          <p className="text-center text-[13px] text-muted py-10">{error}</p>
        )}
        {!loading && !error && spots.length === 0 && (
          <p className="text-center text-[13px] text-muted py-10">
            아직 찜한 스팟이 없어요
          </p>
        )}
        {spots.map((s) => (
          <div
            key={s.id}
            onClick={() => onOpenSpot(s.id)}
            className="flex items-center gap-3 w-full bg-white rounded-[16px] p-3 cursor-pointer shadow-soft"
          >
            <div className="relative shrink-0 w-[72px] h-[72px] rounded-xl overflow-hidden">
              <img
                src={s.image}
                alt={s.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-ink truncate">{s.name}</p>
              <p className="mt-0.5 text-[11px] text-muted truncate">{s.typeLabel}</p>
              <span className="mt-1 flex items-center gap-1 text-[11px] text-muted">
                <Star size={11} color="#A8623E" fill="#A8623E" />
                <span className="font-medium text-ink">{s.rating.toFixed(1)}</span>
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void unsave(s.id);
              }}
              aria-label="찜 해제"
              className="flex items-center justify-center w-9 h-9 rounded-full cursor-pointer shrink-0"
            >
              <Heart size={18} color="#A8623E" fill="#A8623E" />
            </button>
          </div>
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

      <div className="page-end-space" />
    </div>
  );
}
