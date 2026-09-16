import { useState } from "react";
import MainView from "./components/MainView";
import MyRoutesView from "./components/MyRoutesView";
import EditProfileView from "./components/EditProfileView";
import SettingsView from "./components/SettingsView";
import NotiSettingsView from "./components/NotiSettingsView";
import MyReviewsView from "./components/MyReviewsView";
import SavedSpotsView from "./components/SavedSpotsView";
import StaticDocView from "./components/StaticDocView";

export type MyPageView =
  | "main"
  | "routes"
  | "edit"
  | "settings"
  | "notiSettings"
  | "reviews"
  | "savedSpots"
  | "policy"
  | "terms";

export default function MyPage() {
  const [view, setView] = useState<MyPageView>("main");
  const [toast, setToast] = useState<string | null>(null);

  const navigate = (
    window as unknown as { REACT_APP_NAVIGATE?: (p: string) => void }
  ).REACT_APP_NAVIGATE;

  const toTop = () => {
    document.getElementById("app-scroll")?.scrollTo({ top: 0, behavior: "auto" });
  };

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1800);
  };

  const openView = (v: MyPageView) => {
    setView(v);
    toTop();
  };
  const back = () => openView("main");

  return (
    <div className="relative min-h-full">
      {view === "main" && <MainView onOpen={openView} onToast={showToast} />}
      {view === "routes" && <MyRoutesView onBack={back} onToast={showToast} />}
      {view === "edit" && <EditProfileView onBack={back} onToast={showToast} />}
      {view === "settings" && (
        <SettingsView onBack={back} onOpen={openView} onToast={showToast} />
      )}
      {view === "notiSettings" && <NotiSettingsView onBack={() => openView("settings")} />}
      {view === "reviews" && (
        <MyReviewsView
          onBack={back}
          onOpenSpot={(id) => navigate?.(`/spot/${id}`)}
        />
      )}
      {view === "savedSpots" && (
        <SavedSpotsView
          onBack={back}
          onOpenSpot={(id) => navigate?.(`/spot/${id}`)}
        />
      )}
      {view === "policy" && (
        <StaticDocView
          documentType="PRIVACY"
          onBack={() => openView("settings")}
        />
      )}
      {view === "terms" && (
        <StaticDocView
          documentType="TERMS"
          onBack={() => openView("settings")}
        />
      )}

      {/* 토스트 */}
      {toast && (
        <div className="absolute left-1/2 -translate-x-1/2 top-[64px] z-50 px-4 py-2 rounded-full bg-ink/90 text-[12px] font-medium text-white pointer-events-none whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  );
}
