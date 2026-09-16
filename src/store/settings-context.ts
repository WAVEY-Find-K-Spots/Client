import { createContext, useContext } from "react";

export const SETTINGS_STORAGE_KEY = "wavey.settings";

export interface Settings {
  locationEnabled: boolean;
  marketingEnabled: boolean;
  language: string;
}

export const DEFAULT_SETTINGS: Settings = {
  locationEnabled: true,
  marketingEnabled: false,
  language: "한국어",
};

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return { ...DEFAULT_SETTINGS, ...(parsed as Partial<Settings>) };
    }
    return DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export interface SettingsContextValue {
  settings: Settings;
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within <SettingsProvider>");
  return ctx;
}
