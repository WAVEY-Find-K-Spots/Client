import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import StatusBar from "@/components/layout/StatusBar";
import { ApiError } from "@/lib/auth/api";
import { useAuth } from "@/store/auth-context";
import { useProfile } from "@/store/profile-context";

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { completeSocialLogin } = useAuth();
  const { updateProfile } = useProfile();
  const started = useRef(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const code = searchParams.get("code");
    const oauthError = searchParams.get("error");
    window.history.replaceState({}, document.title, window.location.pathname);

    if (oauthError || !code) {
      setErrorMessage("소셜 로그인 인증에 실패했습니다. 다시 시도해 주세요.");
      return;
    }

    completeSocialLogin(code)
      .then((user) => {
        updateProfile({ nickname: user.name, email: user.email });
        navigate("/", { replace: true });
      })
      .catch((error: unknown) => {
        const message = error instanceof ApiError
          ? error.message
          : "로그인 정보를 처리하지 못했습니다.";
        setErrorMessage(message);
      });
  }, [completeSocialLogin, navigate, searchParams, updateProfile]);

  return (
    <div className="min-h-full flex flex-col bg-page">
      <StatusBar variant="dark" />
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        {errorMessage ? (
          <>
            <h1 className="text-[20px] font-bold text-ink">로그인 실패</h1>
            <p className="mt-3 text-[13px] leading-relaxed text-muted">{errorMessage}</p>
            <button
              type="button"
              onClick={() => navigate("/login", { replace: true })}
              className="mt-6 h-11 px-6 rounded-xl bg-brand text-white font-semibold"
            >
              로그인 화면으로 돌아가기
            </button>
          </>
        ) : (
          <>
            <span className="w-9 h-9 rounded-full border-2 border-line border-t-brand animate-spin" />
            <p className="mt-4 text-[13px] text-muted">로그인 정보를 확인하고 있습니다.</p>
          </>
        )}
      </div>
    </div>
  );
}
