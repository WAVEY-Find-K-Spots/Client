import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  STAMPS_STORAGE_KEY,
  StampsContext,
  baselineEarnedIds,
  loadEarnedAt,
  todayShort,
  type StampsContextValue,
} from "./stamps-context";

export function StampsProvider({ children }: { children: ReactNode }) {
  const [earnedAt, setEarnedAt] = useState<Record<string, string>>(loadEarnedAt);

  useEffect(() => {
    try {
      localStorage.setItem(STAMPS_STORAGE_KEY, JSON.stringify(earnedAt));
    } catch {
      /* storage unavailable — keep in-memory only */
    }
  }, [earnedAt]);

  const collectStamp = useCallback((stampId: string) => {
    const date = todayShort();
    setEarnedAt((prev) => (prev[stampId] ? prev : { ...prev, [stampId]: date }));
    return date;
  }, []);

  const value = useMemo<StampsContextValue>(
    () => ({
      earnedAt,
      isEarned: (id) => baselineEarnedIds.has(id) || Boolean(earnedAt[id]),
      earnedDate: (id) => earnedAt[id],
      collectStamp,
    }),
    [earnedAt, collectStamp],
  );

  return <StampsContext.Provider value={value}>{children}</StampsContext.Provider>;
}
