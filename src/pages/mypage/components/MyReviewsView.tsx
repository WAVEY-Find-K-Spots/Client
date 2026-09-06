import StatusBar from "@/components/layout/StatusBar";
import SubHeader from "./SubHeader";
import { Star, ChevronRight } from "lucide-react";

interface MyReviewsViewProps {
  onBack: () => void;
  onOpenSpot: (spotId: string) => void;
}

const myReviews = [
  {
    spotId: "gyeongbokgung",
    spotName: "경복궁",
    rating: 5,
    date: "2026.08.20",
    text: "수문장 교대식 시간 맞춰 갔는데 정말 장관이었어요. 한복 입고 가면 입장 무료!",
  },
  {
    spotId: "namsan",
    spotName: "남산타워",
    rating: 4,
    date: "2026.08.11",
    text: "야경 보러 저녁에 올라갔어요. 케이블카 줄이 길어서 조금 일찍 가는 걸 추천해요.",
  },
  {
    spotId: "bukchon",
    spotName: "북촌한옥마을",
    rating: 5,
    date: "2026.07.30",
    text: "골목마다 분위기가 달라서 사진 찍는 재미가 있어요. 주민 거주 구역이라 조용히!",
  },
];

export default function MyReviewsView({ onBack, onOpenSpot }: MyReviewsViewProps) {
  return (
    <div className="min-h-full bg-page">
      <StatusBar variant="dark" />
      <SubHeader
        title="작성한 리뷰"
        onBack={onBack}
        right={<span className="text-[13px] font-medium text-muted">{myReviews.length}개</span>}
      />

      <div className="px-5 mt-4 flex flex-col gap-3">
        {myReviews.map((r) => (
          <button
            key={r.spotId}
            type="button"
            onClick={() => onOpenSpot(r.spotId)}
            className="w-full bg-white rounded-[16px] shadow-soft p-4 text-left cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-semibold text-ink">{r.spotName}</span>
              <ChevronRight size={16} color="#DDD4CE" strokeWidth={2} />
            </div>
            <div className="mt-1.5 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={13}
                  color="#A8623E"
                  fill={i < r.rating ? "#A8623E" : "none"}
                  strokeWidth={2}
                />
              ))}
              <span className="ml-1 text-[11px] text-muted">{r.date}</span>
            </div>
            <p className="mt-2 text-[12.5px] text-sub leading-relaxed">{r.text}</p>
          </button>
        ))}
      </div>

      <div className="h-24" />
    </div>
  );
}
