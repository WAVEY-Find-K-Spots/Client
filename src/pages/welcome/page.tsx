import StatusBar from "@/components/layout/StatusBar";
import waveyLogo from "@/assets/wavey.png";
import { Compass, Route as RouteIcon, BadgeCheck } from "lucide-react";

const features = [
  {
    icon: Compass,
    title: "K-스팟 탐색",
    desc: "드라마·영화·뮤직비디오 촬영지를 지도에서 바로 찾기",
  },
  {
    icon: RouteIcon,
    title: "나만의 루트",
    desc: "가고 싶은 스팟을 이어 여행 동선을 만들기",
  },
  {
    icon: BadgeCheck,
    title: "방문 스탬프",
    desc: "현장에 도착하면 자동으로 스탬프를 수집",
  },
];

export default function WelcomePage() {
  const navigate = (
    window as unknown as { REACT_APP_NAVIGATE?: (p: string) => void }
  ).REACT_APP_NAVIGATE;

  return (
    <div className="min-h-full flex flex-col bg-page">
      <StatusBar variant="dark" />

      <div className="flex-1 flex flex-col px-8 pt-[14%] pb-8">
        <img
          src={waveyLogo}
          alt="WAVEY"
          className="w-[148px] h-auto select-none"
        />
        <h1 className="mt-6 text-[24px] font-extrabold leading-snug tracking-tight text-ink">
          K-콘텐츠 속 그 장소,
          <br />
          직접 걸어보세요
        </h1>
        <p className="mt-3 text-[13px] text-sub leading-relaxed">
          좋아하는 드라마와 K-POP의 무대를 찾아
          <br />
          나만의 한국 여행을 완성해보세요.
        </p>

        <div className="mt-10 flex flex-col gap-5">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3.5">
              <span className="flex items-center justify-center w-11 h-11 rounded-[14px] bg-cream shrink-0">
                <Icon size={20} color="#A8623E" strokeWidth={2} />
              </span>
              <div className="pt-0.5">
                <p className="text-[14px] font-semibold text-ink">{title}</p>
                <p className="mt-0.5 text-[12px] text-muted leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-10 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => navigate?.("/login")}
            className="w-full h-[54px] rounded-full bg-ink text-white text-[15px] font-semibold cursor-pointer transition active:scale-[0.99] whitespace-nowrap"
          >
            시작하기
          </button>
          <button
            type="button"
            onClick={() => navigate?.("/")}
            className="text-[12px] font-medium text-muted underline underline-offset-2 cursor-pointer whitespace-nowrap"
          >
            로그인 없이 둘러보기
          </button>
        </div>
      </div>
    </div>
  );
}
