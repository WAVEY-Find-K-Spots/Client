/**
 * 발표 시연용 공용 계정. 값은 배포 환경 변수로 넣으며, 비워 두면 기능이 나타나지 않는다.
 * VITE_ 변수는 번들에 그대로 포함되어 공개되므로 시연 전용 계정만 넣어야 한다.
 */
const email = (import.meta.env.VITE_DEMO_EMAIL || "").trim();
const password = import.meta.env.VITE_DEMO_PASSWORD || "";

export const demoAccount = email && password ? { email, password } : null;

/** 공용 계정이 망가지지 않도록 탈퇴·비밀번호 변경을 숨길 때 사용한다. */
export function isDemoAccount(userEmail: string | null | undefined) {
  return (
    demoAccount !== null &&
    userEmail?.trim().toLowerCase() === demoAccount.email.toLowerCase()
  );
}
