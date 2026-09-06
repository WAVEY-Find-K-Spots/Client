import { createContext, useContext } from "react";

export const SETTINGS_STORAGE_KEY = "wavey.settings";

export interface Settings {
  pushEnabled: boolean;
  locationEnabled: boolean;
  marketingEnabled: boolean;
  language: string;
  /* per-category notification toggles */
  notifStamp: boolean;
  notifRoute: boolean;
  notifSystem: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  pushEnabled: true,
  locationEnabled: true,
  marketingEnabled: false,
  language: "한국어",
  notifStamp: true,
  notifRoute: true,
  notifSystem: true,
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
