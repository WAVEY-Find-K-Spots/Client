import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { AUTH_EXPIRED_EVENT, authApi } from "@/lib/auth/api";
import { tokenStorage } from "@/lib/auth/tokenStorage";
import type { AuthUser, SocialProvider } from "@/lib/auth/types";
import { AuthContext, type AuthContextValue } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(tokenStorage.hasSession());

  useEffect(() => {
    const expireSession = () => setUser(null);
    window.addEventListener(AUTH_EXPIRED_EVENT, expireSession);

    if (tokenStorage.hasSession()) {
      authApi.getCurrentUser()
        .then(setUser)
        .catch(() => {
          tokenStorage.clear();
          setUser(null);
        })
        .finally(() => setInitializing(false));
    } else {
      setInitializing(false);
    }

    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, expireSession);
  }, []);

  const beginSocialLogin = useCallback(async (provider: SocialProvider) => {
    const urls = await authApi.getLoginUrls();
    const loginUrl = urls[provider];
    if (!loginUrl) throw new Error(`${provider} 로그인 URL을 찾을 수 없습니다.`);

    if (Capacitor.isNativePlatform()) {
      const nativeLoginUrl = new URL(loginUrl);
      nativeLoginUrl.searchParams.set("platform", "app");
      await Browser.open({ url: nativeLoginUrl.toString() });
      return;
    }

    window.location.assign(loginUrl);
  }, []);

  const completeSocialLogin = useCallback(async (code: string) => {
    const tokens = await authApi.exchangeLoginCode(code);
    tokenStorage.setTokens(tokens);

    try {
      const authenticatedUser = await authApi.getCurrentUser();
      setUser(authenticatedUser);
      return { user: authenticatedUser, isNewUser: tokens.isNewUser };
    } catch (error) {
      tokenStorage.clear();
      throw error;
    }
  }, []);

  const updateProfile = useCallback(async (patch: Parameters<typeof authApi.updateProfile>[0]) => {
    const updated = await authApi.updateProfile(patch);
    setUser(updated);
    return updated;
  }, []);

  const confirmProfilePhoto = useCallback(async (photoUrl: string) => {
    const updated = await authApi.confirmPhoto(photoUrl);
    setUser(updated);
    return updated;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const withdraw = useCallback(async () => {
    try {
      await authApi.withdraw();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    initializing,
    beginSocialLogin,
    completeSocialLogin,
    updateProfile,
    confirmProfilePhoto,
    logout,
    withdraw,
  }), [
    user,
    initializing,
    beginSocialLogin,
    completeSocialLogin,
    updateProfile,
    confirmProfilePhoto,
    logout,
    withdraw,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
