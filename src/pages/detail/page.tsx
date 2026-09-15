import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { createPortal } from "react-dom";
import { spots } from "@/mocks/spots";
import { stamps } from "@/mocks/stamps";
import { useRoute } from "@/store/route-context";
import { useStamps, spotStampId } from "@/store/stamps-context";
import { useAuth } from "@/store/auth-context";
import { ApiError } from "@/lib/auth/api";
import { claimStamp } from "@/lib/stamps-api";
import { STAMP_TEST_MODE } from "@/lib/stamp-test-mode";
import {
  distanceMeters,
  formatDistance,
  getCurrentCoords,
  watchCoords,
  type LatLng,
} from "@/lib/geo";
import { shareContent, type ShareResult } from "@/lib/share";
import {
  toOverlayStamp,
  type OverlayStamp,
} from "@/pages/stamp/adapters";
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

function buildMockOverlay(
  stampId: string,
  spotName: string,
  date: string,
): OverlayStamp {
  const base = stamps.find((s) => s.id === stampId);
  return {
    name: base?.name ?? spotName,
    dateShort: date,
    gradient: base?.gradient,
    kContent: base?.kContent,
  };
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
  const [overlayStamp, setOverlayStamp] = useState<OverlayStamp | null>(null);
  const [apiStamped, setApiStamped] = useState(false);

  const { inRoute, toggleRoute } = useRoute();
  const { isEarned, collectStamp } = useStamps();
  const { user } = useAuth();
  const spot = useMemo(() => spots.find((s) => s.id === id), [id]);

  const numericSpotId =
    id && /^\d+$/.test(id) ? Number(id) : null;

  const navigate = (
    window as unknown as { REACT_APP_NAVIGATE?: (p: string) => void }
  ).REACT_APP_NAVIGATE;

  useEffect(() => {
    const el = document.getElementById("app-scroll");
    if (el) el.scrollTop = 0;
    setTab("info");
    setToast(null);
    setScanning(false);
    setOverlayStamp(null);
    setApiStamped(false);
  }, [id]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const claimViaApi = async (coords: LatLng) => {
    if (numericSpotId == null) return false;
    if (!STAMP_TEST_MODE && !user) {
      setToast("로그인이 필요한 서비스입니다.");
      navigate?.("/login");
      return true;
    }
    try {
      const result = await claimStamp(numericSpotId, {
        latitude: coords.lat,
        longitude: coords.lng,
      });
      setApiStamped(true);
      if (!result.newlyAcquired) {
        setToast("이미 획득한 스탬프예요");
        return true;
      }
      setOverlayStamp(toOverlayStamp(result.stamp));
      return true;
    } catch (err) {
      // 테스트: 거리/인증 실패여도 획득 애니메이션 확인
      if (STAMP_TEST_MODE) {
        setApiStamped(true);
        setOverlayStamp({
          name: spot?.name ?? `스팟 ${numericSpotId}`,
          dateShort: "2026.03.24",
          gradient: "linear-gradient(158deg,#7a3d28,#c96a42)",
          kContent: "테스트 획득 애니메이션",
        });
        return true;
      }
      if (err instanceof ApiError && err.code === "STAMP_TOO_FAR") {
        setToast("조금 더 가까이 가주세요");
      } else if (err instanceof ApiError) {
        setToast(err.message || "스탬프를 획득하지 못했어요.");
      } else {
        setToast("스탬프를 획득하지 못했어요.");
      }
      return true;
    }
  };

  // auto check-in
  useEffect(() => {
    if (!spot) return;
    const mockSid = spotStampId(spot.id);
    if (numericSpotId == null && isEarned(mockSid)) return;
    if (numericSpotId != null && apiStamped) return;

    const target = spot.coord;
    let done = false;
    const unwatch = watchCoords((c) => {
      if (done || distanceMeters(c, target) > CHECKIN_RADIUS_M) return;
      done = true;
      void (async () => {
        if (numericSpotId != null) {
          await claimViaApi(c);
          return;
        }
        const date = collectStamp(mockSid);
        setOverlayStamp(buildMockOverlay(mockSid, spot.name, date));
      })();
    });
    return unwatch;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spot?.id, numericSpotId, apiStamped]);

  if (!spot && numericSpotId == null) {
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

  // numeric API spot without mock entry — minimal placeholder for claim testing
  if (!spot && numericSpotId != null) {
    const handleApiOnlyCheckIn = () => {
      if (apiStamped) {
        setToast("이미 획득한 스탬프예요");
        return;
      }
      if (!STAMP_TEST_MODE && !user) {
        setToast("로그인이 필요한 서비스입니다.");
        navigate?.("/login");
        return;
      }
      setScanning(true);
      getCurrentCoords()
        .then((c) => claimViaApi(c))
        .catch(() =>
          setToast("위치를 확인할 수 없어요. 위치 권한을 허용해 주세요"),
        )
        .finally(() => setScanning(false));
    };

    return (
      <div className="min-h-full bg-page px-5 pt-10">
        <p className="text-[15px] font-semibold text-ink">
          스팟 #{numericSpotId}
        </p>
        <p className="mt-2 text-[13px] text-muted">
          mock 상세 데이터가 없는 API 스팟입니다. 스탬프 획득만 가능해요.
        </p>
        <button
          type="button"
          onClick={handleApiOnlyCheckIn}
          disabled={scanning}
          className="mt-6 w-full h-[52px] rounded-full bg-brand text-white text-[14px] font-semibold cursor-pointer disabled:opacity-70"
        >
          {apiStamped
            ? "스탬프 획득!"
            : scanning
              ? "위치 확인 중…"
              : "스탬프 획득"}
        </button>
        <button
          type="button"
          onClick={() => navigate?.("/")}
          className="mt-3 w-full h-11 rounded-full bg-cream text-ink text-[13px] font-semibold cursor-pointer"
        >
          목록으로
        </button>
        {toast && (
          <div className="mt-4 text-center text-[12px] text-muted">{toast}</div>
        )}
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
            document.getElementById("phone-frame") ?? document.body,
          )}
      </div>
    );
  }

  if (!spot) return null;

  const collapsed = tab !== "info";
  const routeAdded = inRoute(spot.id);
  const mockStampId = spotStampId(spot.id);
  const stamped =
    numericSpotId != null ? apiStamped : isEarned(mockStampId);

  const handleCheckIn = () => {
    if (stamped) {
      setToast("이미 획득한 스탬프예요");
      return;
    }
    setScanning(true);
    getCurrentCoords()
      .then(async (c) => {
        if (numericSpotId != null) {
          await claimViaApi(c);
          return;
        }
        const d = distanceMeters(c, spot.coord);
        if (STAMP_TEST_MODE || d <= CHECKIN_RADIUS_M) {
          const date = collectStamp(mockStampId);
          setOverlayStamp(buildMockOverlay(mockStampId, spot.name, date));
        } else {
          setToast(`스팟에서 약 ${formatDistance(d)} 떨어져 있어요`);
        }
      })
      .catch(() => {
        if (STAMP_TEST_MODE) {
          // GPS 실패해도 애니메이션 확인
          if (numericSpotId != null) {
            setOverlayStamp({
              name: spot.name,
              dateShort: "2026.03.24",
              gradient: "linear-gradient(158deg,#7a3d28,#c96a42)",
              kContent: "테스트 획득 애니메이션",
            });
            setApiStamped(true);
          } else {
            const date = collectStamp(mockStampId);
            setOverlayStamp(buildMockOverlay(mockStampId, spot.name, date));
          }
          return;
        }
        setToast("위치를 확인할 수 없어요. 위치 권한을 허용해 주세요");
      })
      .finally(() => setScanning(false));
  };

  const ctaSlot = document.getElementById("detail-cta-slot");
  const phoneFrame = document.getElementById("phone-frame");

  return (
    <div className="min-h-full bg-page">
      <DetailHero
        spot={spot}
        collapsed={collapsed}
        onBack={() => navigate?.("/")}
      />

      {tab === "info" && <RatingBlock spot={spot} />}

      <div className="mt-3 flex border-b border-line">
        {tabs.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`relative flex-1 py-3 text-[13px] cursor-pointer whitespace-nowrap ${
                active ? "text-ink font-semibold" : "text-muted font-medium"
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

      {tab === "info" && <DetailInfo spot={spot} />}
      {tab === "content" && <ContentTab spot={spot} />}
      {tab === "reviews" && <ReviewsTab spot={spot} />}
      {tab === "nearby" && (
        <NearbyTab spot={spot} onOpen={(nid) => navigate?.(`/spot/${nid}`)} />
      )}

      <div className="h-40" />

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
                stamped
                  ? "bg-brand text-white"
                  : "bg-cream border border-brand text-brand"
              }`}
            >
              <Star
                size={18}
                color={stamped ? "#FFFFFF" : "#A8623E"}
                fill={stamped ? "#FFFFFF" : "none"}
              />
              <span className="text-[14px] font-semibold">
                {stamped
                  ? "스탬프 획득!"
                  : scanning
                    ? "위치 확인 중…"
                    : "스탬프 획득"}
              </span>
            </button>
          </div>,
          ctaSlot,
        )}

      {toast &&
        createPortal(
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[170px] z-[55] px-4 py-2 rounded-full bg-ink/90 text-[12px] font-medium text-white pointer-events-none whitespace-nowrap">
            {toast}
          </div>,
          phoneFrame ?? document.body,
        )}

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
