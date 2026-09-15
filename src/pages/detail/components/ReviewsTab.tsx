import { useEffect, useState } from "react";
import type { ReviewView } from "@/lib/spot-adapters";
import { Star, Globe, Trash2 } from "lucide-react";

interface ReviewsTabProps {
  rating: number;
  reviewCount: number;
  reviews: ReviewView[];
  loading?: boolean;
  canWrite?: boolean;
  myReview?: ReviewView | null;
  submitting?: boolean;
  onSubmit?: (input: { rating: number; body: string }) => void;
  onDelete?: () => void;
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className="flex items-center justify-center w-7 h-7 cursor-pointer"
          aria-label={`${v}점`}
        >
          <Star size={22} color="#A8623E" fill={v <= value ? "#A8623E" : "none"} />
        </button>
      ))}
    </div>
  );
}

export default function ReviewsTab({
  rating,
  reviewCount,
  reviews,
  loading,
  canWrite,
  myReview,
  submitting,
  onSubmit,
  onDelete,
}: ReviewsTabProps) {
  const [editing, setEditing] = useState(false);
  const [draftRating, setDraftRating] = useState(myReview?.rating ?? 5);
  const [draftBody, setDraftBody] = useState(myReview?.text ?? "");

  useEffect(() => {
    setDraftRating(myReview?.rating ?? 5);
    setDraftBody(myReview?.text ?? "");
    setEditing(false);
  }, [myReview]);

  const submit = () => {
    if (!draftBody.trim() || !onSubmit) return;
    onSubmit({ rating: draftRating, body: draftBody.trim() });
    setEditing(false);
  };

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

      {/* write / edit form */}
      {canWrite && (myReview == null || editing) && (
        <div className="mt-4 bg-white rounded-2xl p-4 shadow-soft">
          <p className="text-[13px] font-semibold text-ink mb-2">
            {myReview ? "내 리뷰 수정" : "리뷰 작성"}
          </p>
          <StarPicker value={draftRating} onChange={setDraftRating} />
          <textarea
            value={draftBody}
            onChange={(e) => setDraftBody(e.target.value)}
            maxLength={2000}
            rows={3}
            placeholder="이 스팟은 어땠나요?"
            className="mt-3 w-full rounded-xl border border-line px-3 py-2 text-[13px] text-ink resize-none outline-none focus:border-brand"
          />
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={submit}
              disabled={submitting || !draftBody.trim()}
              className="flex-1 h-10 rounded-full bg-ink text-white text-[13px] font-semibold cursor-pointer disabled:opacity-50"
            >
              {submitting ? "저장 중..." : myReview ? "수정 완료" : "등록"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="h-10 px-4 rounded-full bg-cream text-ink text-[13px] font-semibold cursor-pointer"
              >
                취소
              </button>
            )}
          </div>
        </div>
      )}

      {canWrite && myReview != null && !editing && (
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="px-3 h-8 rounded-full bg-cream text-ink text-[12px] font-medium cursor-pointer"
          >
            내 리뷰 수정
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={submitting}
            className="flex items-center gap-1 px-3 h-8 rounded-full bg-cream text-brand text-[12px] font-medium cursor-pointer disabled:opacity-50"
          >
            <Trash2 size={12} /> 삭제
          </button>
        </div>
      )}

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
              key={r.reviewId ?? `${r.author}-${i}`}
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
