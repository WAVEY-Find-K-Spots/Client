import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { createPortal } from "react-dom";
import { spots } from "@/mocks/spots";
import { stamps, type StampItem } from "@/mocks/stamps";
import { useRoute } from "@/store/route-context";
import { useStamps, spotStampId } from "@/store/stamps-context";
import { distanceMeters, formatDistance, getCurrentCoords, watchCoords } from "@/lib/geo";
import { shareContent, type ShareResult } from "@/lib/share";
import DetailHero from "./components/DetailHero";
import RatingBlock from "./components/RatingBlock";
import DetailInfo from "./components/DetailInfo";
import ContentTab from "./components/ContentTab";
import ReviewsTab from "./components/ReviewsTab";
import NearbyTab from "./components/NearbyTab";
import AcquiredOverlay from "@/pages/stamp/components/AcquiredOverlay";
import { Plus, Check, Star } from "lucide-react";

const CHECKIN_RADIUS_M = 150;

const shareToastMsg: Record<ShareResult, string> = {
  shared: "공유했어요",
  copied: "공유 링크를 복사했어요",
  failed: "공유하지 못했어요",
};

function buildEarnedStamp(stampId: string, spotName: string, date: string): StampItem {
  const base = stamps.find((s) => s.id === stampId);
  return base
    ? { ...base, earned: true, dateShort: date }
    : { id: stampId, name: spotName, region: "seoul", earned: true, dateShort: date };
}

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
  const [toast, setToast] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [overlayStamp, setOverlayStamp] = useState<StampItem | null>(null);

  const { inRoute, toggleRoute } = useRoute();
  const { isEarned, collectStamp } = useStamps();
  const spot = useMemo(() => spots.find((s) => s.id === id), [id]);

  const navigate = (
    window as unknown as { REACT_APP_NAVIGATE?: (p: string) => void }
  ).REACT_APP_NAVIGATE;

  // reset scroll when switching spot
  useEffect(() => {
    const el = document.getElementById("app-scroll");
    if (el) el.scrollTop = 0;
    setTab("info");
    setToast(null);
    setScanning(false);
    setOverlayStamp(null);
  }, [id]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  // auto check-in: watch position while on this spot; grant the stamp when within range
  useEffect(() => {
    if (!spot) return;
    const sid = spotStampId(spot.id);
    if (isEarned(sid)) return;
    const target = spot.coord;
    let done = false;
    const unwatch = watchCoords((c) => {
      if (done || distanceMeters(c, target) > CHECKIN_RADIUS_M) return;
      done = true;
      const date = collectStamp(sid);
      setOverlayStamp(buildEarnedStamp(sid, spot.name, date));
    });
    return unwatch;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spot?.id]);

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

  const stampId = spotStampId(spot.id);
  const stamped = isEarned(stampId);

  const handleCheckIn = () => {
    if (stamped) {
      setToast("이미 획득한 스탬프예요");
      return;
    }
    setScanning(true);
    getCurrentCoords()
      .then((c) => {
        const d = distanceMeters(c, spot.coord);
        if (d <= CHECKIN_RADIUS_M) {
          const date = collectStamp(stampId);
          setOverlayStamp(buildEarnedStamp(stampId, spot.name, date));
        } else {
          setToast(`스팟에서 약 ${formatDistance(d)} 떨어져 있어요`);
        }
      })
      .catch(() => setToast("위치를 확인할 수 없어요. 위치 권한을 허용해 주세요"))
      .finally(() => setScanning(false));
  };

  const ctaSlot = document.getElementById("detail-cta-slot");
  const phoneFrame = document.getElementById("phone-frame");

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
              onClick={handleCheckIn}
              disabled={scanning}
              className={`flex-1 h-[58px] rounded-full flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap disabled:opacity-70 ${
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
                {stamped ? "스탬프 획득!" : scanning ? "위치 확인 중…" : "스탬프 획득"}
              </span>
            </button>
          </div>,
          ctaSlot
        )}

      {/* toast */}
      {toast &&
        createPortal(
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[170px] z-[55] px-4 py-2 rounded-full bg-ink/90 text-[12px] font-medium text-white pointer-events-none whitespace-nowrap">
            {toast}
          </div>,
          phoneFrame ?? document.body,
        )}

      {/* stamp acquired celebration */}
      {overlayStamp &&
        createPortal(
          <AcquiredOverlay
            stamp={overlayStamp}
            onClose={() => setOverlayStamp(null)}
            onShare={async () => {
              const res = await shareContent({
                title: `${overlayStamp.name} 스탬프 획득!`,
                text: `WAVEY에서 ${overlayStamp.name} 방문 스탬프를 모았어요.`,
              });
              setToast(shareToastMsg[res]);
            }}
            onShowBook={() => {
              setOverlayStamp(null);
              navigate?.("/stamp");
            }}
          />,
          phoneFrame ?? document.body,
        )}
    </div>
  );
}