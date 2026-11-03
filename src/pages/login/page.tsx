import { useState } from "react";
import { ChevronLeft, Eye, EyeOff, Mail } from "lucide-react";
import StatusBar from "@/components/layout/StatusBar";
import waveyLogo from "@/assets/wavey.png";
import { ApiError, authApi } from "@/lib/auth/api";
import { GoogleMark, KakaoMark } from "./SocialMarks";
import { useAuth } from "@/store/auth-context";
import type { SocialProvider } from "@/lib/auth/types";

const providers: {
  key: SocialProvider;
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
];

type LocalMode = "login" | "signup" | "forgot" | "reset";

const fieldClass =
  "h-12 w-full rounded-[14px] border border-line bg-white px-4 text-[13px] text-ink outline-none placeholder:text-[#B7AAA1] focus:border-brand";

function initialResetToken() {
  return new URLSearchParams(window.location.search).get("token")?.trim() || "";
}

export default function LoginPage() {
  const resetToken = initialResetToken();
  const [pending, setPending] = useState<SocialProvider | "local" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [localOpen, setLocalOpen] = useState(Boolean(resetToken));
  const [localMode, setLocalMode] = useState<LocalMode>(resetToken ? "reset" : "login");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const { beginSocialLogin, loginLocal, signupLocal } = useAuth();

  const navigate = (
    window as unknown as { REACT_APP_NAVIGATE?: (p: string) => void }
  ).REACT_APP_NAVIGATE;

  const login = async (provider: SocialProvider) => {
    if (pending) return;
    setPending(provider);
    setError(null);
    setNotice(null);
    try {
      await beginSocialLogin(provider);
    } catch {
      setError("로그인을 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      setPending(null);
    }
  };

  const submitLocal = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    setError(null);
    setNotice(null);

    if (localMode === "forgot") {
      if (!email.trim()) {
        setError("재설정 메일을 받을 이메일을 입력해 주세요.");
        return;
      }
      setPending("local");
      try {
        await authApi.requestLocalPasswordReset({ email: email.trim() });
        setNotice("가입된 로컬 계정인 경우 비밀번호 재설정 메일을 발송했습니다.");
      } catch (requestError) {
        setError(
          requestError instanceof ApiError
            ? requestError.message
            : "재설정 메일을 요청하지 못했습니다.",
        );
      } finally {
        setPending(null);
      }
      return;
    }

    if (localMode === "reset") {
      if (!resetToken) {
        setError("비밀번호 재설정 링크가 올바르지 않습니다.");
        return;
      }
      if (password.length < 8) {
        setError("새 비밀번호는 8자 이상이어야 합니다.");
        return;
      }
      if (password !== passwordConfirm) {
        setError("새 비밀번호 확인이 일치하지 않습니다.");
        return;
      }
      setPending("local");
      try {
        await authApi.confirmLocalPasswordReset({ token: resetToken, newPassword: password });
        window.history.replaceState({}, "", "/login");
        setPassword("");
        setPasswordConfirm("");
        setLocalMode("login");
        setNotice("비밀번호가 재설정되었습니다. 새 비밀번호로 로그인해 주세요.");
      } catch (resetError) {
        setError(
          resetError instanceof ApiError
            ? resetError.message
            : "비밀번호를 재설정하지 못했습니다.",
        );
      } finally {
        setPending(null);
      }
      return;
    }

    if (!email.trim() || !password) {
      setError("이메일과 비밀번호를 입력해 주세요.");
      return;
    }
    if (localMode === "signup" && !name.trim()) {
      setError("이름을 입력해 주세요.");
      return;
    }
    if (localMode === "signup" && password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (localMode === "signup" && password !== passwordConfirm) {
      setError("비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    setPending("local");
    try {
      if (localMode === "signup") {
        await signupLocal({ email: email.trim(), password, name: name.trim() });
      } else {
        await loginLocal({ email: email.trim(), password });
      }
      navigate?.("/mypage");
    } catch (localError) {
      setError(
        localError instanceof ApiError
          ? localError.message
          : "로컬 인증을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setPending(null);
    }
  };

  const changeLocalMode = (mode: LocalMode) => {
    setLocalMode(mode);
    setError(null);
    setNotice(null);
    setPassword("");
    setPasswordConfirm("");
  };

  const passwordField = (placeholder: string, value: string, setValue: (value: string) => void) => (
    <div className="relative">
      <input
        className={`${fieldClass} pr-11`}
        type={showPassword ? "text" : "password"}
        autoComplete={localMode === "login" ? "current-password" : "new-password"}
        placeholder={placeholder}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <button
        type="button"
        onClick={() => setShowPassword((show) => !show)}
        aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
      >
        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );

  return (
    <div className="min-h-full bg-page">
      <StatusBar variant="dark" />

      <div className="flex min-h-[calc(100%-32px)] flex-col items-center px-8 pb-10 pt-8">
        <img src={waveyLogo} alt="WAVEY" className="h-auto w-[200px] max-w-[66%] select-none" />
        <p className="mt-1 text-center text-[13px] leading-relaxed text-muted">
          드라마와 K-POP, 영화 속
          <br />
          그 장소로 떠나는 여행
        </p>

        <div className="mt-8 flex w-full max-w-[360px] flex-col items-center">
          <span className="text-[12px] font-medium text-muted">간편 로그인</span>

          <div className="mt-4 flex items-center justify-center gap-5">
            {providers.map(({ key, label, className, Mark }) => (
              <button
                key={key}
                type="button"
                onClick={() => void login(key)}
                disabled={pending !== null}
                aria-label={`${label} 계정으로 로그인`}
                className={`relative flex h-14 w-14 cursor-pointer items-center justify-center rounded-full shadow-soft transition active:scale-95 disabled:opacity-60 ${className}`}
              >
                <Mark className="h-6 w-6" />
                {pending === key && (
                  <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-current" />
                )}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setLocalOpen((open) => !open);
                setError(null);
                setNotice(null);
              }}
              disabled={pending !== null}
              aria-label="이메일로 로그인"
              aria-expanded={localOpen}
              className={`relative flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border shadow-soft transition active:scale-95 disabled:opacity-60 ${
                localOpen ? "border-brand bg-ink text-white" : "border-line bg-white text-brand"
              }`}
            >
              <Mail className="h-6 w-6" />
              {pending === "local" && (
                <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-current" />
              )}
            </button>
          </div>

          {localOpen && (
            <section className="mt-5 w-full rounded-[20px] bg-white p-4 shadow-soft">
              {(localMode === "login" || localMode === "signup") ? (
                <div className="grid grid-cols-2 rounded-[12px] bg-cream p-1">
                  {(["login", "signup"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => changeLocalMode(mode)}
                      className={`h-9 rounded-[10px] text-[12px] font-semibold transition ${
                        localMode === mode ? "bg-white text-ink shadow-sm" : "text-muted"
                      }`}
                    >
                      {mode === "login" ? "이메일 로그인" : "회원가입"}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {!resetToken && (
                    <button
                      type="button"
                      onClick={() => changeLocalMode("login")}
                      aria-label="이메일 로그인으로 돌아가기"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-cream text-sub"
                    >
                      <ChevronLeft size={17} />
                    </button>
                  )}
                  <div>
                    <h2 className="text-[14px] font-semibold text-ink">
                      {localMode === "forgot" ? "비밀번호 찾기" : "새 비밀번호 설정"}
                    </h2>
                    <p className="mt-0.5 text-[10px] text-muted">
                      {localMode === "forgot"
                        ? "가입한 이메일로 일회용 재설정 링크를 보내드려요."
                        : "메일로 받은 링크를 확인했습니다."}
                    </p>
                  </div>
                </div>
              )}

              <form className="mt-4 space-y-2.5" onSubmit={submitLocal}>
                {localMode === "signup" && (
                  <input
                    className={fieldClass}
                    autoComplete="name"
                    placeholder="이름 예: 웨이비"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                )}
                {localMode !== "reset" && (
                  <input
                    className={fieldClass}
                    type="email"
                    autoComplete="email"
                    placeholder="이메일 예: wavey@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                )}
                {(localMode === "login" || localMode === "signup") &&
                  passwordField(localMode === "signup" ? "비밀번호 8자 이상" : "비밀번호", password, setPassword)}
                {localMode === "signup" &&
                  passwordField("비밀번호 다시 입력", passwordConfirm, setPasswordConfirm)}
                {localMode === "reset" && (
                  <>
                    {passwordField("새 비밀번호 8자 이상", password, setPassword)}
                    {passwordField("새 비밀번호 다시 입력", passwordConfirm, setPasswordConfirm)}
                  </>
                )}

                <button
                  type="submit"
                  disabled={pending !== null}
                  className="h-12 w-full rounded-[14px] bg-ink text-[13px] font-semibold text-white disabled:opacity-50"
                >
                  {pending === "local"
                    ? "처리 중..."
                    : localMode === "signup"
                      ? "이메일로 회원가입"
                      : localMode === "forgot"
                        ? "재설정 메일 받기"
                        : localMode === "reset"
                          ? "새 비밀번호 저장"
                          : "이메일로 로그인"}
                </button>
              </form>

              {localMode === "login" && (
                <div className="mt-3 text-center">
                  <button
                    type="button"
                    onClick={() => changeLocalMode("forgot")}
                    className="text-[11px] font-medium text-muted underline underline-offset-2"
                  >
                    비밀번호 찾기
                  </button>
                </div>
              )}
            </section>
          )}

          {notice && (
            <p role="status" className="mt-4 rounded-[10px] bg-[#E7EFE3] px-3 py-2 text-center text-[11px] leading-relaxed text-[#477143]">
              {notice}
            </p>
          )}
          {error && (
            <p role="alert" className="mt-4 text-center text-[12px] text-red-600">
              {error}
            </p>
          )}

          <p className="mt-6 text-center text-[11px] leading-relaxed text-muted">
            로그인 시{" "}
            <button type="button" onClick={() => navigate?.("/legal/terms")} className="cursor-pointer text-sub underline underline-offset-2">
              이용약관
            </button>{" "}
            및{" "}
            <button type="button" onClick={() => navigate?.("/legal/privacy")} className="cursor-pointer text-sub underline underline-offset-2">
              개인정보처리방침
            </button>
            에
            <br />
            동의하게 됩니다
          </p>

          <div className="mt-4 flex items-center gap-3 text-[12px] font-medium text-muted">
            <button type="button" onClick={() => navigate?.("/")} className="cursor-pointer whitespace-nowrap underline underline-offset-2">
              로그인 없이 둘러보기
            </button>
            <span className="h-3 w-px bg-line" />
            <button type="button" onClick={() => navigate?.("/welcome")} className="cursor-pointer whitespace-nowrap underline underline-offset-2">
              WAVEY 소개
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
