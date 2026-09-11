import type { TokenResponse } from "./types";

const ACCESS_TOKEN_KEY = "wavey.auth.access-token";
const REFRESH_TOKEN_KEY = "wavey.auth.refresh-token";

function read(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function remove(storage: Storage, key: string) {
  try {
    storage.removeItem(key);
  } catch {
    // Private browsing or restricted storage: nothing else to clear.
  }
}

export const tokenStorage = {
  getAccessToken: () => read(sessionStorage, ACCESS_TOKEN_KEY),
  getRefreshToken: () => read(localStorage, REFRESH_TOKEN_KEY),

  setTokens(tokens: TokenResponse) {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  },

  clear() {
    remove(sessionStorage, ACCESS_TOKEN_KEY);
    remove(localStorage, REFRESH_TOKEN_KEY);
  },

  hasSession() {
    return Boolean(this.getAccessToken() || this.getRefreshToken());
  },
};
