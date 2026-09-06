import { createContext, useContext } from "react";
import { stamps } from "@/mocks/stamps";

export const STAMPS_STORAGE_KEY = "wavey.stamps.earned";

/** stamp id for a given spot id */
export const spotStampId = (spotId: string) => `st-${spotId}`;

/** ids that ship pre-earned in the mock data */
export const baselineEarnedIds = new Set(
  stamps.filter((s) => s.earned).map((s) => s.id),
);

export function todayShort(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
}

export function loadEarnedAt(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STAMPS_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, string>;
    }
    return {};
  } catch {
    return {};
  }
}

export interface StampsContextValue {
  /** runtime-collected stamp id -> visit date ("YYYY.MM.DD") */
  earnedAt: Record<string, string>;
  isEarned: (stampId: string) => boolean;
  /** date string a stamp was earned (mock baseline has no runtime date) */
  earnedDate: (stampId: string) => string | undefined;
  /** collect a stamp; returns the visit date. no-op if already earned. */
  collectStamp: (stampId: string) => string;
}

export const StampsContext = createContext<StampsContextValue | null>(null);

export function useStamps(): StampsContextValue {
  const ctx = useContext(StampsContext);
  if (!ctx) throw new Error("useStamps must be used within <StampsProvider>");
  return ctx;
}
