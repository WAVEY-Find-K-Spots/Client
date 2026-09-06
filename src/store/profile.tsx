import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  PROFILE_STORAGE_KEY,
  ProfileContext,
  loadProfile,
  type Profile,
  type ProfileContextValue,
} from "./profile-context";

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(loadProfile);

  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch {
      /* storage unavailable */
    }
  }, [profile]);

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  }, []);

  const value = useMemo<ProfileContextValue>(
    () => ({ profile, updateProfile }),
    [profile, updateProfile],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}
