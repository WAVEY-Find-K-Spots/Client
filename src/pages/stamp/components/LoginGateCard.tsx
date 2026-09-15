interface LoginGateCardProps {
  title?: string;
  description: string;
  onLogin?: () => void;
  showCta?: boolean;
  variant?: "light" | "dark";
  className?: string;
}

export default function LoginGateCard({
  title = "로그인이 필요한 서비스입니다.",
  description,
  onLogin,
  showCta = false,
  variant = "light",
  className = "",
}: LoginGateCardProps) {
  const dark = variant === "dark";

  return (
    <div
      className={`flex flex-col items-center text-center ${
        dark ? "" : "rounded-[16px] bg-cream px-5 py-8"
      } ${className}`}
    >
      <p
        className={`text-[15px] font-semibold ${
          dark ? "text-white" : "text-ink"
        }`}
      >
        {title}
      </p>
      <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
        {description}
      </p>
      {showCta && onLogin && (
        <button
          type="button"
          onClick={onLogin}
          className={`mt-4 h-10 px-5 rounded-full text-[13px] font-semibold cursor-pointer whitespace-nowrap ${
            dark ? "bg-brand text-white" : "bg-ink text-white"
          }`}
        >
          로그인하기
        </button>
      )}
    </div>
  );
}
