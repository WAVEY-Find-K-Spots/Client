export type NotificationLocale = "ko" | "en";

interface RelativeTimeLabels {
  justNow: string;
  minutesAgo: (minutes: number) => string;
  hoursAgo: (hours: number) => string;
  daysAgo: (days: number) => string;
}

export function formatNotificationTime(
  createdAt: string,
  locale: NotificationLocale,
  labels: RelativeTimeLabels,
  now = Date.now(),
) {
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return "";

  const seconds = Math.max(0, Math.floor((now - created.getTime()) / 1000));
  if (seconds < 60) return labels.justNow;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return labels.minutesAgo(minutes);

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return labels.hoursAgo(hours);

  const days = Math.floor(hours / 24);
  if (days < 7) return labels.daysAgo(days);

  const currentYear = new Date(now).getFullYear();
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "ko-KR", {
    year: created.getFullYear() === currentYear ? undefined : "numeric",
    month: "short",
    day: "numeric",
  }).format(created);
}
