import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Share2 } from "lucide-react";
import StatusBar from "@/components/layout/StatusBar";
import AcquiredOverlay from "@/pages/stamp/components/AcquiredOverlay";
import { ApiError } from "@/lib/auth/api";
import {
  getMyBadges,
  getMyStamps,
  getStampDetail,
  type BadgeCollection,
  type StampItem,
} from "@/lib/stamps-api";
import { shareContent, type ShareResult } from "@/lib/share";
import { useAuth } from "@/store/auth-context";
import { STAMP_TEST_MODE } from "@/lib/stamp-test-mode";
import {
  toOverlayStamp,
  remainingForNextBadge,
  nextBadgeProgressPercent,
  sortStampBook,
  type OverlayStamp,
} from "./adapters";
import StampbookView from "./components/StampbookView";
import BadgeView from "./components/BadgeView";
import BadgeAcquiredOverlay, {
  type OverlayBadge,
} from "./components/BadgeAcquiredOverlay";

const shareToast: Record<ShareResult, string> = {
  shared: "공유했어요",
  copied: "공유 링크를 복사했어요",
  failed: "공유하지 못했어요",
};

const PAGE_SIZE = 20;

type View = "book" | "badge";

function errorMessage(err: unknown, fallback: string) {
  if (err instanceof ApiError) return err.message || fallback;
  return fallback;
}

export default function StampTab() {
  const { user, initializing } = useAuth();
  const navigate = (
    window as unknown as { REACT_APP_NAVIGATE?: (p: string) => void }
  ).REACT_APP_NAVIGATE;
  const goLogin = () => navigate?.("/login");
  const requireLogin = STAMP_TEST_MODE
    ? false
    : !initializing && !user;

  const [view, setView] = useState<View>("book");
  const [activeStamp, setActiveStamp] = useState<StampItem | null>(null);
  const [previewOverlay, setPreviewOverlay] = useState<OverlayStamp | null>(
    null,
  );
  const [previewBadge, setPreviewBadge] = useState<OverlayBadge | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [regionKey, setRegionKey] = useState("all");
  const [regionId, setRegionId] = useState<number | null>(null);

  const [stamps, setStamps] = useState<StampItem[]>([]);
  const [collectedCount, setCollectedCount] = useState(0);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [bookLoading, setBookLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [bookError, setBookError] = useState<string | null>(null);

  const [badges, setBadges] = useState<BadgeCollection | null>(null);
  const [badgeLoading, setBadgeLoading] = useState(false);
  const [badgeError, setBadgeError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1800);
  };

  const loadStampBook = useCallback(
    async (filterRegionId: number | null, pageToLoad: number, append: boolean) => {
      if (append) setLoadingMore(true);
      else {
        setBookLoading(true);
        setBookError(null);
      }
      try {
        const data = await getMyStamps({
          page: pageToLoad,
          size: PAGE_SIZE,
          language: "ko",
          ...(filterRegionId != null ? { regionId: filterRegionId } : {}),
        });
        setCollectedCount(data.collectedCount);
        setPage(data.page);
        setHasNext(data.hasNext);
        setStamps((prev) =>
          sortStampBook(append ? [...prev, ...data.stamps] : data.stamps),
        );
      } catch (err) {
        if (!append) {
          setBookError(errorMessage(err, "스탬프북을 불러오지 못했어요."));
          setStamps([]);
        } else {
          showToast(errorMessage(err, "더 불러오지 못했어요."));
        }
      } finally {
        setBookLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  const loadBadges = useCallback(async () => {
    setBadgeLoading(true);
    setBadgeError(null);
    try {
      const data = await getMyBadges("ko");
      setBadges(data);
    } catch (err) {
      setBadgeError(errorMessage(err, "배지함을 불러오지 못했어요."));
    } finally {
      setBadgeLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!STAMP_TEST_MODE && (initializing || !user)) {
      setStamps([]);
      setCollectedCount(0);
      setHasNext(false);
      setPage(0);
      setBookLoading(false);
      setBookError(null);
      return;
    }
    if (!STAMP_TEST_MODE && initializing) return;
    void loadStampBook(regionId, 0, false);
  }, [initializing, user, regionId, loadStampBook]);

  useEffect(() => {
    if (!STAMP_TEST_MODE && (initializing || !user)) {
      setBadges(null);
      setBadgeLoading(false);
      setBadgeError(null);
      return;
    }
    if (!STAMP_TEST_MODE && initializing) return;
    void loadBadges();
  }, [initializing, user, loadBadges]);

  const handleRegionChange = (key: string, nextRegionId: number | null) => {
    setRegionKey(key);
    setRegionId(nextRegionId);
  };

  const openStamp = async (stamp: StampItem) => {
    if (!stamp.acquired || stamp.stampId == null) {
      showToast("아직 획득하지 않은 스탬프예요");
      return;
    }
    setActiveStamp(stamp);
    try {
      const detail = await getStampDetail(stamp.stampId, "ko");
      setActiveStamp(detail);
    } catch {
      /* 목록 데이터 유지 */
    }
  };

  const shareStampbook = async () => {
    const res = await shareContent({
      title: "WAVEY 스탬프북",
      text: "내가 방문한 K-스팟 스탬프를 확인해보세요.",
    });
    showToast(shareToast[res]);
  };

  const shareStamp = async (stamp: StampItem) => {
    const res = await shareContent({
      title: `${stamp.name} 스탬프 획득!`,
      text: `WAVEY에서 ${stamp.name} 방문 스탬프를 모았어요.`,
    });
    showToast(shareToast[res]);
  };

  const shareBadge = async (badge: OverlayBadge) => {
    const res = await shareContent({
      title: `${badge.name} 뱃지 획득!`,
      text: `WAVEY에서 ${badge.name} 뱃지를 모았어요.`,
    });
    showToast(shareToast[res]);
  };

  const title = view === "book" ? "스탬프북" : "뱃지 컬렉션";
  const overlayStamp = previewOverlay
    ?? (activeStamp ? toOverlayStamp(activeStamp) : null);

  const playAcquireAnimation = () => {
    setPreviewBadge(null);
    setPreviewOverlay({
      name: stamps[0]?.name ?? "경복궁",
      dateShort: "2026.03.24",
      imageUrl: stamps[0]?.imageUrl ?? null,
      gradient: "linear-gradient(158deg,#7a3d28,#c96a42)",
      kContent: "테스트 획득 애니메이션",
    });
  };

  const playBadgeAnimation = () => {
    setPreviewOverlay(null);
    setActiveStamp(null);
    const sample = badges?.acquired[0] ?? badges?.inProgress[0];
    setPreviewBadge({
      name: sample?.name ?? "서울 탐험가",
      description:
        sample?.description ?? "서울 스팟을 모아 획득한 특별한 뱃지예요",
      imageUrl: sample?.imageUrl ?? null,
      dateShort: "2026.03.24",
    });
  };

  return (
    <div className="min-h-full bg-page">
      <StatusBar variant="dark" />

      {STAMP_TEST_MODE && (
        <div className="mx-5 mt-2 rounded-[12px] bg-brand/15 px-3 py-2 flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium text-brand shrink-0">
            TEST MODE
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={playAcquireAnimation}
              className="h-7 px-2.5 rounded-full bg-brand text-white text-[10px] font-semibold cursor-pointer whitespace-nowrap"
            >
              스탬프 애니
            </button>
            <button
              type="button"
              onClick={playBadgeAnimation}
              className="h-7 px-2.5 rounded-full bg-ink text-white text-[10px] font-semibold cursor-pointer whitespace-nowrap"
            >
              뱃지 애니
            </button>
          </div>
        </div>
      )}

      <div className="px-5 pt-1 flex items-center justify-between">
        <h1 className="text-[22px] font-extrabold tracking-tight text-ink">
          {title}
        </h1>
        <button
          type="button"
          onClick={shareStampbook}
          aria-label="공유하기"
          className="flex items-center justify-center w-9 h-9 rounded-2xl bg-cream cursor-pointer whitespace-nowrap"
        >
          <Share2 size={17} color="#A8623E" strokeWidth={1.9} />
        </button>
      </div>

      <div className="mt-4 px-5">
        <div className="flex items-center gap-5 border-b border-line">
          {(["book", "badge"] as View[]).map((v) => {
            const active = view === v;
            return (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`relative pb-2.5 text-[15px] font-semibold cursor-pointer whitespace-nowrap ${
                  active ? "text-brand" : "text-muted"
                }`}
              >
                {v === "book" ? "스탬프북" : "뱃지 컬렉션"}
                {active && (
                  <span className="absolute left-0 right-0 bottom-0 h-[2.5px] rounded-full bg-brand" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5">
        {view === "book" ? (
          <StampbookView
            stamps={stamps}
            collectedCount={collectedCount}
            badgeAcquiredCount={badges?.acquiredCount ?? 0}
            progressPercent={
              badges ? nextBadgeProgressPercent(badges.inProgress) : 0
            }
            nextBadgeRemaining={
              badges ? remainingForNextBadge(badges.inProgress) : null
            }
            regionKey={regionKey}
            loading={initializing || bookLoading}
            loadingMore={loadingMore}
            error={bookError}
            hasNext={hasNext}
            requireLogin={requireLogin}
            onLogin={goLogin}
            onRegionChange={handleRegionChange}
            onRetry={() => void loadStampBook(regionId, 0, false)}
            onLoadMore={() => void loadStampBook(regionId, page + 1, true)}
            onOpenStamp={(s) => void openStamp(s)}
          />
        ) : (
          <BadgeView
            data={badges}
            loading={initializing || badgeLoading}
            error={badgeError}
            requireLogin={requireLogin}
            onLogin={goLogin}
            onRetry={() => void loadBadges()}
          />
        )}
      </div>

      <div className="h-24" />

      {toast && (
        <div className="absolute left-1/2 -translate-x-1/2 top-[64px] z-50 px-4 py-2 rounded-full bg-ink/90 text-[12px] font-medium text-white pointer-events-none whitespace-nowrap">
          {toast}
        </div>
      )}

      {overlayStamp &&
        createPortal(
          <AcquiredOverlay
            stamp={overlayStamp}
            onClose={() => {
              setActiveStamp(null);
              setPreviewOverlay(null);
            }}
            onShare={() => activeStamp && void shareStamp(activeStamp)}
            onShowBook={() => {
              setView("book");
              setActiveStamp(null);
              setPreviewOverlay(null);
              showToast("스탬프북을 확인해보세요");
            }}
          />,
          document.getElementById("phone-frame") ?? document.body,
        )}

      {previewBadge &&
        createPortal(
          <BadgeAcquiredOverlay
            badge={previewBadge}
            onClose={() => setPreviewBadge(null)}
            onShare={() => void shareBadge(previewBadge)}
            onShowBadges={() => {
              setView("badge");
              setPreviewBadge(null);
              showToast("뱃지함을 확인해보세요");
            }}
          />,
          document.getElementById("phone-frame") ?? document.body,
        )}
    </div>
  );
}
