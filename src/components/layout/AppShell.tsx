import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";
import { Sparkles } from "lucide-react";

const NO_NAV_ROUTES = ["/login"];

export default function AppShell() {
  const { pathname } = useLocation();
  const showNav = !NO_NAV_ROUTES.includes(pathname);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center gap-14 bg-[#f4e9de] lg:py-8 px-0">
      {/* Desktop backdrop accent panel */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-[46%] h-full bg-gradient-to-br from-[#efe1d1] to-[#f8f0e8]" />
        <div className="absolute bottom-0 right-0 w-[46%] h-full bg-gradient-to-tl from-[#efe1d1] to-[#faf3ec]" />
      </div>
      {/* subtle center glow behind phone */}
      <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] rounded-full bg-gradient-to-b from-[#ead5c0]/40 to-transparent blur-2xl" />

      {/* Left side brand copy (large screens only) */}
      <div className="hidden lg:flex relative z-10 flex-col justify-center w-[300px] gap-2">
        <div className="flex items-center gap-2 mb-4">
          <span className="flex items-center justify-center w-9 h-9 rounded-2xl bg-ink">
            <Sparkles size={17} color="#F7EBE0" />
          </span>
          <span className="text-2xl font-extrabold tracking-tight text-ink">WAVEY</span>
        </div>
        <p className="text-ink/80 text-[15px] leading-relaxed mb-3">
          드라마와 K-POP, 영화 속
          <br />
          그 장소로 떠나는 여행.
        </p>
        <p className="text-muted text-[13px] leading-relaxed">
          K-콘텐츠의 스팟을 찾고, 루트를 만들고,
          <br />
          방문 스탬프를 모아보세요.
        </p>
        <div className="mt-6 flex items-center gap-1.5 text-[12px] text-brand font-medium">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand" />
          Find K-Spots 가이드
        </div>
      </div>

      {/* Phone device frame — iPhone 16 ratio 393x852 */}
      <div
        id="phone-frame"
        className="relative z-10 w-full max-w-[440px] min-h-screen lg:min-h-0 lg:max-w-none lg:w-[393px] lg:h-[852px] lg:rounded-[46px] lg:border-[10px] lg:border-ink/90 lg:shadow-2xl overflow-hidden bg-page phone-viewport"
      >
        {/* Scrollable app content */}
        <div
          id="app-scroll"
          className="absolute inset-0 overflow-y-auto no-scrollbar bg-page"
        >
          <Outlet />
        </div>
        {/* Detail CTA slot — mounted here, controlled by detail page via portal */}
        <div id="detail-cta-slot" className="absolute z-30 inset-x-0 bottom-[94px] pointer-events-none" />
        {/* Floating pill bottom navigation */}
        {showNav && <BottomNav />}
      </div>
    </div>
  );
}