import { useState } from "react";
import StatusBar from "@/components/layout/StatusBar";
import waveyLogo from "@/assets/wavey.png";
import { GoogleMark, AppleMark, KakaoMark } from "./SocialMarks";

type Provider = "google" | "apple" | "kakao";

const providers: {
  key: Provider;
  label: string;
  className: string;
  Mark: (p: { className?: string }) => React.ReactElement;
}[] = [
  {
    key: "kakao",
    label: "카카오",
    className: "bg-[#FEE500] text-[#191919]",
    Mark: KakaoMark,
  },
  {
    key: "google",
    label: "구글",
    className: "bg-white border border-line text-ink",
    Mark: GoogleMark,
  },
  {
    key: "apple",
    label: "Apple",
    className: "bg-[#111111] text-white",
    Mark: AppleMark,
  },
];

export default function LoginPage() {
  const [pending, setPending] = useState<Provider | null>(null);

  const navigate = (
    window as unknown as { REACT_APP_NAVIGATE?: (p: string) => void }
  ).REACT_APP_NAVIGATE;

  const login = (p: Provider) => {
    if (pending) return;
    setPending(p);
    window.setTimeout(() => navigate?.("/"), 700);
  };

  return (
    <div className="min-h-full flex flex-col bg-page">
      <StatusBar variant="dark" />

      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-10">
        {/* brand */}
        <img
          src={waveyLogo}
          alt="WAVEY"
          className="w-[220px] max-w-[70%] h-auto select-none"
        />
        <p className="mt-1 text-[13px] text-muted text-center leading-relaxed">
          드라마와 K-POP, 영화 속
          <br />
          그 장소로 떠나는 여행
        </p>

        {/* social login */}
        <div className="mt-9 flex flex-col items-center">
          <span className="text-[12px] font-medium text-muted">간편 로그인</span>

          <div className="mt-4 flex items-center justify-center gap-5">
            {providers.map(({ key, label, className, Mark }) => (
              <button
                key={key}
                type="button"
                onClick={() => login(key)}
                disabled={pending !== null}
                aria-label={`${label} 계정으로 로그인`}
                className={`relative flex items-center justify-center w-14 h-14 rounded-full shadow-soft transition active:scale-95 disabled:opacity-60 cursor-pointer ${className}`}
              >
                <Mark className="w-6 h-6" />
                {pending === key && (
                  <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-current animate-spin" />
                )}
              </button>
            ))}
          </div>

          <p className="mt-6 text-[11px] text-muted text-center leading-relaxed">
            로그인 시 <span className="text-sub underline">이용약관</span> 및{" "}
            <span className="text-sub underline">개인정보처리방침</span>에
            <br />
            동의하게 됩니다
          </p>

          <div className="mt-4 flex items-center gap-3 text-[12px] font-medium text-muted">
            <button
              type="button"
              onClick={() => navigate?.("/")}
              className="underline underline-offset-2 cursor-pointer whitespace-nowrap"
            >
              로그인 없이 둘러보기
            </button>
            <span className="w-px h-3 bg-line" />
            <button
              type="button"
              onClick={() => navigate?.("/welcome")}
              className="underline underline-offset-2 cursor-pointer whitespace-nowrap"
            >
              WAVEY 소개
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
