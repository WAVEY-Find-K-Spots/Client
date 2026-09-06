import { useRef, useState } from "react";
import StatusBar from "@/components/layout/StatusBar";
import waveyLogo from "@/assets/wavey.png";
import {
  Compass,
  Route as RouteIcon,
  BadgeCheck,
  MapPin,
  Check,
  ArrowRight,
} from "lucide-react";

type SlideKey = "spot" | "route" | "stamp";

interface Slide {
  key: SlideKey;
  icon: typeof Compass;
  eyebrow: string;
  title: string;
  desc: string;
  points: string[];
}

const slides: Slide[] = [
  {
    key: "spot",
    icon: Compass,
    eyebrow: "탐색",
    title: "K-스팟을 지도에서 찾기",
    desc: "드라마·영화·뮤직비디오 촬영지를 위치와 함께 확인하세요.",
    points: ["장면·작품 정보 함께 제공", "카테고리·지역별 필터", "리뷰와 평점 확인"],
  },
  {
    key: "route",
    icon: RouteIcon,
    eyebrow: "계획",
    title: "나만의 여행 루트 만들기",
    desc: "가고 싶은 스팟을 담아 방문 순서대로 이어보세요.",
    points: ["드래그로 순서 변경", "실제 지도 위 경로 표시", "이동 수단별 예상 시간"],
  },
  {
    key: "stamp",
    icon: BadgeCheck,
    eyebrow: "기록",
    title: "방문하면 스탬프 수집",
    desc: "현장에 도착하면 자동으로, 인식이 안 되면 버튼으로 체크인.",
    points: ["150m 근접 시 자동 인식", "스탬프북에 방문 기록", "지역·뱃지 도전 과제"],
  },
];

function Illustration({ kind }: { kind: SlideKey }) {
  return (
    <div
      className="relative w-full h-[208px] rounded-[24px] overflow-hidden"
      style={{ background: "linear-gradient(160deg,#F1E3D4,#F8EFE6 60%,#EEE0D0)" }}
    >
      {/* faint grid */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(rgba(168,98,62,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(168,98,62,0.06) 1px,transparent 1px)",
          backgroundSize: "34px 34px",
        }}
      />

      {kind === "spot" && (
        <>
          {[
            { l: "24%", t: "30%" },
            { l: "60%", t: "22%" },
            { l: "46%", t: "62%" },
          ].map((p, i) => (
            <span
              key={i}
              className="absolute -translate-x-1/2 -translate-y-full flex items-center justify-center w-9 h-9 rounded-full bg-ink"
              style={{ left: p.l, top: p.t, boxShadow: "0 6px 14px rgba(44,24,16,0.25)" }}
            >
              <MapPin size={16} color="#F7EBE0" strokeWidth={2} />
            </span>
          ))}
        </>
      )}

      {kind === "route" && (
        <div className="absolute inset-0 flex items-center justify-center gap-6">
          <div className="absolute left-[16%] right-[16%] top-1/2 border-t-2 border-dashed border-brand/50" />
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className="relative flex items-center justify-center w-10 h-10 rounded-full bg-ink text-white text-[13px] font-bold"
              style={{ boxShadow: "0 6px 14px rgba(44,24,16,0.22)" }}
            >
              {n}
            </span>
          ))}
        </div>
      )}

      {kind === "stamp" && (
        <div className="absolute inset-0 flex items-center justify-center gap-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="relative w-[70px] h-[70px] rounded-full p-[5px] bg-cream"
              style={{ border: "2px solid #A8623E" }}
            >
              <span
                className="block w-full h-full rounded-full"
                style={{ background: "linear-gradient(158deg,#7a3d28,#c96a42)" }}
              />
              {i < 2 && (
                <span
                  className="absolute left-1/2 -translate-x-1/2 top-full -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full bg-brand"
                  style={{ boxShadow: "0 4px 10px rgba(168,98,62,0.45)" }}
                >
                  <Check size={12} color="#fff" strokeWidth={3} />
                </span>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function WelcomePage() {
  const [step, setStep] = useState(0);
  const dragX = useRef<number | null>(null);

  const navigate = (
    window as unknown as { REACT_APP_NAVIGATE?: (p: string) => void }
  ).REACT_APP_NAVIGATE;

  const last = step === slides.length - 1;
  const slide = slides[step];
  const Icon = slide.icon;

  const go = (n: number) => setStep(Math.max(0, Math.min(slides.length - 1, n)));
  const next = () => (last ? navigate?.("/login") : go(step + 1));

  const onPointerDown = (e: React.PointerEvent) => {
    dragX.current = e.clientX;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (dragX.current === null) return;
    const dx = e.clientX - dragX.current;
    dragX.current = null;
    if (dx < -40) go(step + 1);
    else if (dx > 40) go(step - 1);
  };

  return (
    <div className="min-h-full flex flex-col bg-page">
      <StatusBar variant="dark" />

      {/* header */}
      <div className="flex items-center justify-between px-6 pt-2">
        <img src={waveyLogo} alt="WAVEY" className="w-[92px] h-auto select-none" />
        <button
          type="button"
          onClick={() => navigate?.("/login")}
          className="text-[12px] font-medium text-muted cursor-pointer whitespace-nowrap"
        >
          건너뛰기
        </button>
      </div>

      {/* slide */}
      <div
        className="flex-1 flex flex-col px-8 pt-6 select-none"
        style={{ touchAction: "pan-y" }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <div key={slide.key} className="wv-slidein flex flex-col">
          <Illustration kind={slide.key} />

          <div className="mt-7 flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-[10px] bg-cream">
              <Icon size={15} color="#A8623E" strokeWidth={2} />
            </span>
            <span className="text-[12px] font-semibold text-brand">
              {slide.eyebrow}
            </span>
          </div>

          <h1 className="mt-3 text-[23px] font-extrabold leading-snug tracking-tight text-ink">
            {slide.title}
          </h1>
          <p className="mt-2.5 text-[13px] text-sub leading-relaxed">{slide.desc}</p>

          <ul className="mt-5 flex flex-col gap-2.5">
            {slide.points.map((p) => (
              <li key={p} className="flex items-center gap-2.5">
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-brand shrink-0">
                  <Check size={11} color="#fff" strokeWidth={3} />
                </span>
                <span className="text-[12.5px] text-ink">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* footer */}
      <div className="px-8 pb-8 pt-4">
        <div className="flex items-center justify-center gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.key}
              type="button"
              aria-label={`${i + 1}번째 소개`}
              onClick={() => go(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-5 bg-brand" : "w-1.5 bg-line"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={next}
          className="mt-5 w-full h-[54px] rounded-full bg-ink text-white text-[15px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-[0.99] whitespace-nowrap"
        >
          {last ? "시작하기" : "다음"}
          <ArrowRight size={17} color="#fff" strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}
