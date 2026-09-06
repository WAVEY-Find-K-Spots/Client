import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { createPortal } from "react-dom";
import { spots } from "@/mocks/spots";
import { useRoute } from "@/store/route-context";
import DetailHero from "./components/DetailHero";
import RatingBlock from "./components/RatingBlock";
import DetailInfo from "./components/DetailInfo";
import ContentTab from "./components/ContentTab";
import ReviewsTab from "./components/ReviewsTab";
import NearbyTab from "./components/NearbyTab";
import { Plus, Check, Star } from "lucide-react";

type TabKey = "info" | "content" | "reviews" | "nearby";
const tabs: { key: TabKey; label: string }[] = [
  { key: "info", label: "정보" },
  { key: "content", label: "콘텐츠" },
  { key: "reviews", label: "리뷰" },
  { key: "nearby", label: "주변 스팟" },
];

export default function SpotDetail() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<TabKey>("info");
  const [stamped, setStamped] = useState(false);

  const { inRoute, toggleRoute } = useRoute();
  const spot = useMemo(() => spots.find((s) => s.id === id), [id]);

  const navigate = (
    window as unknown as { REACT_APP_NAVIGATE?: (p: string) => void }
  ).REACT_APP_NAVIGATE;

  // reset scroll when switching spot
  useEffect(() => {
    const el = document.getElementById("app-scroll");
    if (el) el.scrollTop = 0;
    setTab("info");
    setStamped(false);
  }, [id]);

  if (!spot) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center bg-page px-8 text-center">
        <p className="text-[15px] font-semibold text-ink">스팟을 찾을 수 없어요</p>
        <button
          type="button"
          onClick={() => navigate?.("/")}
          className="mt-4 px-5 h-11 rounded-full bg-ink text-white text-[13px] font-semibold cursor-pointer whitespace-nowrap"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  const collapsed = tab !== "info";
  const routeAdded = inRoute(spot.id);

  const ctaSlot = document.getElementById("detail-cta-slot");

  return (
    <div className="min-h-full bg-page">
      {/* hero */}
      <DetailHero
        spot={spot}
        collapsed={collapsed}
        onBack={() => navigate?.("/")}
      />

      {/* rating + tags (info only) */}
      {tab === "info" && <RatingBlock spot={spot} />}

      {/* tab bar */}
      <div className="mt-3 flex border-b border-line">
        {tabs.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`relative flex-1 py-3 text-[13px] cursor-pointer whitespace-nowrap ${
                active
                  ? "text-ink font-semibold"
                  : "text-muted font-medium"
              }`}
            >
              {t.label}
              {active && (
                <span className="absolute inset-x-0 -bottom-px h-[2.5px] rounded-full bg-brand" />
              )}
            </button>
          );
        })}
      </div>

      {/* tab content */}
      {tab === "info" && <DetailInfo spot={spot} />}
      {tab === "content" && <ContentTab spot={spot} />}
      {tab === "reviews" && <ReviewsTab spot={spot} />}
      {tab === "nearby" && (
        <NearbyTab spot={spot} onOpen={(nid) => navigate?.(`/spot/${nid}`)} />
      )}

      {/* bottom spacer so content clears the floating CTA + nav */}
      <div className="h-40" />

      {/* pinned CTA above the floating nav via portal */}
      {ctaSlot &&
        createPortal(
          <div className="px-5 flex gap-2.5 pointer-events-auto">
            <button
              type="button"
              onClick={() => toggleRoute(spot.id)}
              className={`flex-1 h-[58px] rounded-full flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                routeAdded ? "bg-brand text-white" : "bg-ink text-white"
              }`}
            >
              <span className="flex items-center justify-center w-5 h-5">
                {routeAdded ? (
                  <Check size={19} color="#FFFFFF" />
                ) : (
                  <Plus size={19} color="#FFFFFF" />
                )}
              </span>
              <span className="text-[14px] font-semibold">
                {routeAdded ? "루트에 추가됨" : "루트에 추가"}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setStamped((v) => !v)}
              className={`flex-1 h-[58px] rounded-full flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                stamped ? "bg-brand text-white" : "bg-cream border border-brand text-brand"
              }`}
            >
              <span className="flex items-center justify-center w-5 h-5">
                <Star
                  size={18}
                  color={stamped ? "#FFFFFF" : "#A8623E"}
                  fill={stamped ? "#FFFFFF" : "none"}
                />
              </span>
              <span className="text-[14px] font-semibold">
                {stamped ? "스탬프 획득!" : "스탬프 획득"}
              </span>
            </button>
          </div>,
          ctaSlot
        )}
    </div>
  );
}