import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  SETTINGS_STORAGE_KEY,
  SettingsContext,
  loadSettings,
  type Settings,
  type SettingsContextValue,
} from "./settings-context";

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* storage unavailable */
    }
  }, [settings]);

  const setSetting = useCallback(
    <K extends keyof Settings>(key: K, value: Settings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const value = useMemo<SettingsContextValue>(
    () => ({ settings, setSetting }),
    [settings, setSetting],
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}
