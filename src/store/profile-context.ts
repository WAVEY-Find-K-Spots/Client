import { createContext, useContext } from "react";

export const PROFILE_STORAGE_KEY = "wavey.profile";

export interface Profile {
  nickname: string;
  email: string;
  nationality: string;
  language: string;
}

export const DEFAULT_PROFILE: Profile = {
  nickname: "여행자_시영",
  email: "siyoung@wavey.kr",
  nationality: "대한민국",
  language: "한국어",
};

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return { ...DEFAULT_PROFILE, ...(parsed as Partial<Profile>) };
    }
    return DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export interface ProfileContextValue {
  profile: Profile;
  updateProfile: (patch: Partial<Profile>) => void;
}

export const ProfileContext = createContext<ProfileContextValue | null>(null);

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within <ProfileProvider>");
  return ctx;
}
