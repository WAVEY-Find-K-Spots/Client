import { useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import StatusBar from "@/components/layout/StatusBar";
import { ApiError } from "@/lib/auth/api";
import { useAuth } from "@/store/auth-context";
import SubHeader from "./SubHeader";

interface PasswordChangeViewProps {
  onBack: () => void;
  onToast: (message: string) => void;
}

const inputClass =
  "h-12 w-full rounded-[14px] border border-line bg-white px-4 pr-11 text-[13px] text-ink outline-none placeholder:text-[#B7AAA1] focus:border-brand";

export default function PasswordChangeView({ onBack, onToast }: PasswordChangeViewProps) {
  const { t } = useTranslation();
  const { changeLocalPassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const navigate = (
    window as unknown as { REACT_APP_NAVIGATE?: (path: string) => void }
  ).REACT_APP_NAVIGATE;

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    setError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError(t("mypage.password.required"));
      return;
    }
    if (newPassword.length < 8) {
      setError(t("mypage.password.minimum"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("mypage.password.mismatch"));
      return;
    }

    setPending(true);
    try {
      await changeLocalPassword({ currentPassword, newPassword });
      onToast(t("mypage.password.changed"));
      navigate?.("/login");
    } catch (changeError) {
      setError(
        changeError instanceof ApiError
          ? changeError.message
          : t("mypage.password.failed"),
      );
    } finally {
      setPending(false);
    }
  };

  const fields = [
    {
      label: t("mypage.password.current"),
      value: currentPassword,
      setValue: setCurrentPassword,
      autoComplete: "current-password",
    },
    {
      label: t("mypage.password.new"),
      value: newPassword,
      setValue: setNewPassword,
      autoComplete: "new-password",
    },
    {
      label: t("mypage.password.confirm"),
      value: confirmPassword,
      setValue: setConfirmPassword,
      autoComplete: "new-password",
    },
  ];

  return (
    <div className="min-h-full bg-page">
      <StatusBar variant="dark" />
      <SubHeader title={t("mypage.password.title")} onBack={onBack} />

      <main className="px-5 pt-5">
        <section className="rounded-[20px] bg-white p-5 shadow-soft">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream">
              <KeyRound size={19} color="#A8623E" />
            </span>
            <div>
              <h2 className="text-[15px] font-semibold text-ink">
                {t("mypage.password.heading")}
              </h2>
              <p className="mt-1 text-[11px] leading-relaxed text-muted">
                {t("mypage.password.description")}
              </p>
            </div>
          </div>

          <form className="mt-5 space-y-4" onSubmit={submit}>
            {fields.map((field) => (
              <label key={field.label} className="block">
                <span className="mb-1.5 block text-[11px] font-semibold text-sub">
                  {field.label}
                </span>
                <span className="relative block">
                  <input
                    className={inputClass}
                    type={showPassword ? "text" : "password"}
                    autoComplete={field.autoComplete}
                    placeholder={field.label}
                    value={field.value}
                    onChange={(event) => field.setValue(event.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((show) => !show)}
                    aria-label={showPassword ? t("mypage.password.hide") : t("mypage.password.show")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </span>
              </label>
            ))}

            {error && (
              <p role="alert" className="rounded-[10px] bg-[#FBE8E5] px-3 py-2 text-[11px] text-[#B4453A]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="h-12 w-full rounded-[14px] bg-ink text-[13px] font-semibold text-white disabled:opacity-50"
            >
              {pending ? t("mypage.password.processing") : t("mypage.password.submit")}
            </button>
          </form>
        </section>

        <p className="mt-3 px-2 text-[10px] leading-relaxed text-muted">
          {t("mypage.password.logoutNotice")}
        </p>
      </main>
    </div>
  );
}
