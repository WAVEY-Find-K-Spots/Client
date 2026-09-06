import { useState } from "react";
import StatusBar from "@/components/layout/StatusBar";
import StampbookView from "./components/StampbookView";
import BadgeView from "./components/BadgeView";
import AcquiredOverlay from "./components/AcquiredOverlay";
import { stamps, type StampItem } from "@/mocks/stamps";
import { Share2 } from "lucide-react";

type View = "book" | "badge";

export default function StampTab() {
  const [view, setView] = useState<View>("book");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const activeStamp = activeId
    ? (stamps.find((s) => s.id === activeId) ?? null)
    : null;

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1800);
  };

  const openStamp = (stamp: StampItem) => setActiveId(stamp.id);

  const closeOverlay = () => setActiveId(null);

  const goBook = () => {
    setView("book");
    setActiveId(null);
  };

  const title = view === "book" ? "스탬프북" : "뱃지 컬렉션";

  return (
    <div className="min-h-full bg-page">
      <StatusBar variant="dark" />

      {/* 헤더 */}
      <div className="px-5 pt-1 flex items-center justify-between">
        <h1 className="text-[22px] font-extrabold tracking-tight text-ink">
          {title}
        </h1>
        <button
          type="button"
          onClick={() => showToast("스탬프북을 공유했어요")}
          aria-label="공유하기"
          className="flex items-center justify-center w-9 h-9 rounded-2xl bg-cream cursor-pointer whitespace-nowrap"
        >
          <span className="flex items-center justify-center w-4 h-4">
            <Share2 size={17} color="#A8623E" strokeWidth={1.9} />
          </span>
        </button>
      </div>

      {/* 스탬프북 / 뱃지 전환 */}
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

      {/* 콘텐츠 */}
      <div className="mt-5">
        {view === "book" ? (
          <StampbookView onOpenStamp={openStamp} />
        ) : (
          <BadgeView />
        )}
      </div>

      {/* 바텀 내비 여백 */}
      <div className="h-24" />

      {/* 토스트 */}
      {toast && (
        <div className="absolute left-1/2 -translate-x-1/2 top-[64px] z-50 px-4 py-2 rounded-full bg-ink/90 text-[12px] font-medium text-white pointer-events-none whitespace-nowrap">
          {toast}
        </div>
      )}

      {/* 스탬프 획득 오버레이 */}
      {activeStamp && (
        <AcquiredOverlay
          stamp={activeStamp}
          onClose={closeOverlay}
          onShowBook={() => {
            goBook();
            showToast("스탬프북을 확인해보세요");
          }}
        />
      )}
    </div>
  );
}