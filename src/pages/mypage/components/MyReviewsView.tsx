import { useEffect, useState } from "react";
import StatusBar from "@/components/layout/StatusBar";
import SubHeader from "./SubHeader";
import { getMyReviews, type SpotReviewItem } from "@/lib/reviews-api";
import { getSpot } from "@/lib/spots-api";
import { Star, ChevronRight } from "lucide-react";

interface MyReviewsViewProps {
  onBack: () => void;
  onOpenSpot: (spotId: string) => void;
}

function formatDate(iso: string): string {
  return iso.slice(0, 10).replace(/-/g, ".");
}

export default function MyReviewsView({ onBack, onOpenSpot }: MyReviewsViewProps) {
  const [reviews, setReviews] = useState<SpotReviewItem[]>([]);
  const [spotNames, setSpotNames] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getMyReviews(0, 20)
      .then((result) => {
        if (cancelled) return;
        setReviews(result.reviews);
        setHasNext(result.hasNext);
        setPage(0);
        void loadSpotNames(result.reviews);
      })
      .catch(() => {
        if (!cancelled) setError("작성한 리뷰를 불러오지 못했어요.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadSpotNames = async (items: SpotReviewItem[]) => {
    const uniqueSpotIds = [...new Set(items.map((r) => r.spotId))];
    const results = await Promise.allSettled(
      uniqueSpotIds.map((id) => getSpot(id)),
    );
    setSpotNames((prev) => {
      const next = { ...prev };
      results.forEach((r, i) => {
        if (r.status === "fulfilled") next[uniqueSpotIds[i]] = r.value.name;
      });
      return next;
    });
  };

  const loadMore = () => {
    if (loadingMore || !hasNext) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    getMyReviews(nextPage, 20)
      .then((result) => {
        setReviews((prev) => [...prev, ...result.reviews]);
        setHasNext(result.hasNext);
        setPage(nextPage);
        void loadSpotNames(result.reviews);
      })
      .catch(() => setHasNext(false))
      .finally(() => setLoadingMore(false));
  };

  return (
    <div className="min-h-full bg-page">
      <StatusBar variant="dark" />
      <SubHeader
        title="작성한 리뷰"
        onBack={onBack}
        right={<span className="text-[13px] font-medium text-muted">{reviews.length}개</span>}
      />

      <div className="px-5 mt-4 flex flex-col gap-3">
        {loading && (
          <p className="text-center text-[13px] text-muted py-10">불러오는 중...</p>
        )}
        {!loading && error && (
          <p className="text-center text-[13px] text-muted py-10">{error}</p>
        )}
        {!loading && !error && reviews.length === 0 && (
          <p className="text-center text-[13px] text-muted py-10">
            아직 작성한 리뷰가 없어요
          </p>
        )}
        {reviews.map((r) => (
          <button
            key={r.reviewId}
            type="button"
            onClick={() => onOpenSpot(String(r.spotId))}
            className="w-full bg-white rounded-[16px] shadow-soft p-4 text-left cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-semibold text-ink">
                {spotNames[r.spotId] ?? `스팟 #${r.spotId}`}
              </span>
              <ChevronRight size={16} color="#DDD4CE" strokeWidth={2} />
            </div>
            <div className="mt-1.5 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={13}
                  color="#A8623E"
                  fill={i < Math.round(r.rating) ? "#A8623E" : "none"}
                  strokeWidth={2}
                />
              ))}
              <span className="ml-1 text-[11px] text-muted">{formatDate(r.createdAt)}</span>
            </div>
            <p className="mt-2 text-[12.5px] text-sub leading-relaxed">{r.body}</p>
          </button>
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

      <div className="h-24" />
    </div>
  );
}
