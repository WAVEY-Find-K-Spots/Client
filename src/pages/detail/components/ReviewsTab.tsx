import type { ReviewItem } from "@/mocks/spots";
import { Star, Globe } from "lucide-react";

interface ReviewsTabProps {
  rating: number;
  reviewCount: number;
  reviews: ReviewItem[];
  loading?: boolean;
}

export default function ReviewsTab({
  rating,
  reviewCount,
  reviews,
  loading,
}: ReviewsTabProps) {
  return (
    <div className="px-5 pt-5">
      {/* summary */}
      <div className="flex items-center gap-4 rounded-2xl bg-cream p-4">
        <div className="flex flex-col items-center justify-center">
          <span className="text-[30px] font-extrabold text-ink">
            {rating.toFixed(1)}
          </span>
          <span className="flex items-center gap-0.5 mt-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="flex items-center justify-center w-3 h-3"
              >
                <Star
                  size={12}
                  color="#A8623E"
                  fill={i < Math.round(rating) ? "#A8623E" : "none"}
                />
              </span>
            ))}
          </span>
        </div>
        <div className="h-10 w-px bg-line mx-1" />
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-ink">매우 훌륭함</p>
          <p className="text-[12px] text-muted mt-0.5">
            리뷰 {reviewCount.toLocaleString()}개 기준
          </p>
        </div>
      </div>

      {/* list */}
      {loading ? (
        <p className="text-center text-[13px] text-muted py-10">
          불러오는 중...
        </p>
      ) : reviews.length === 0 ? (
        <p className="text-center text-[13px] text-muted py-10">
          아직 작성된 리뷰가 없어요
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {reviews.map((r, i) => (
            <div
              key={`${r.author}-${i}`}
              className="bg-white rounded-2xl p-4 shadow-soft"
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-ink text-white text-[13px] font-bold">
                  {r.author.charAt(0)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[13px] font-semibold text-ink truncate">
                      {r.author}
                    </p>
                    {r.flag && (
                      <span className="flex items-center gap-0.5 text-[10px] text-muted">
                        <Globe size={10} />
                        {r.flag}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted mt-0.5">{r.date}</p>
                </div>
                <div className="flex items-center gap-0.5">
                  {[0, 1, 2, 3, 4].map((i2) => (
                    <span
                      key={i2}
                      className="flex items-center justify-center w-3 h-3"
                    >
                      <Star
                        size={11}
                        color="#A8623E"
                        fill={i2 < r.rating ? "#A8623E" : "none"}
                      />
                    </span>
                  ))}
                </div>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-sub">
                {r.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
