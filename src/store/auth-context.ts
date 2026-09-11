import { createContext, useContext } from "react";
import type { AuthUser, SocialProvider } from "@/lib/auth/types";

export interface AuthContextValue {
  user: AuthUser | null;
  initializing: boolean;
  beginSocialLogin: (provider: SocialProvider) => Promise<void>;
  completeSocialLogin: (code: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  withdraw: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within <AuthProvider>");
  return context;
}
