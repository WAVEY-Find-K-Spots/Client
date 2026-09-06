import { useState } from "react";
import MainView from "./components/MainView";
import MyRoutesView from "./components/MyRoutesView";
import EditProfileView from "./components/EditProfileView";

type View = "main" | "routes" | "edit";

export default function MyPage() {
  const [view, setView] = useState<View>("main");
  const [toast, setToast] = useState<string | null>(null);

  const toTop = () => {
    document
      .getElementById("app-scroll")
      ?.scrollTo({ top: 0, behavior: "auto" });
  };

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1800);
  };

  const openView = (v: View) => {
    setView(v);
    toTop();
  };

  return (
    <div className="relative min-h-full">
      {view === "routes" && (
        <MyRoutesView onBack={() => openView("main")} onToast={showToast} />
      )}
      {view === "edit" && (
        <EditProfileView onBack={() => openView("main")} onToast={showToast} />
      )}
      {view === "main" && (
        <MainView
          onOpenRoutes={() => openView("routes")}
          onOpenEdit={() => openView("edit")}
          onToast={showToast}
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