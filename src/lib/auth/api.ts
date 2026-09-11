import { tokenStorage } from "./tokenStorage";
import type {
  ApiResponse,
  AuthUser,
  LoginUrls,
  TokenResponse,
} from "./types";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080")
  .replace(/\/$/, "");

export const AUTH_EXPIRED_EVENT = "wavey:auth-expired";

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string | undefined;

  constructor(
    status: number,
    code: string | undefined,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

type FetchOptions = NonNullable<Parameters<typeof fetch>[1]>;

type RequestOptions = FetchOptions & {
  authenticated?: boolean;
  retryOnUnauthorized?: boolean;
};

let refreshRequest: Promise<TokenResponse> | null = null;

async function readResponse<T>(response: Response): Promise<ApiResponse<T> | null> {
  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;
  return response.json() as Promise<ApiResponse<T>>;
}

async function send<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const body = await readResponse<T>(response);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      body?.error?.code,
      body?.error?.message || body?.message || "요청 처리 중 오류가 발생했습니다.",
    );
  }

  return body?.data as T;
}

async function refreshTokens(): Promise<TokenResponse> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    throw new ApiError(401, "AUTH_REFRESH_TOKEN_MISSING", "로그인이 필요합니다.");
  }

  if (!refreshRequest) {
    refreshRequest = send<TokenResponse>("/api/v1/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
      .then((tokens) => {
        tokenStorage.setTokens(tokens);
        return tokens;
      })
      .catch((error) => {
        tokenStorage.clear();
        window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
        throw error;
      })
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
}

export async function apiRequest<T>(
  path: string,
  { authenticated = true, retryOnUnauthorized = true, ...options }: RequestOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (authenticated) {
    let accessToken = tokenStorage.getAccessToken();
    if (!accessToken && tokenStorage.getRefreshToken()) {
      accessToken = (await refreshTokens()).accessToken;
    }
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  }

  try {
    return await send<T>(path, { ...options, headers });
  } catch (error) {
    if (
      authenticated &&
      retryOnUnauthorized &&
      error instanceof ApiError &&
      error.status === 401 &&
      tokenStorage.getRefreshToken()
    ) {
      const tokens = await refreshTokens();
      headers.set("Authorization", `${tokens.tokenType} ${tokens.accessToken}`);
      return send<T>(path, { ...options, headers });
    }
    throw error;
  }
}

export const authApi = {
  getLoginUrls: () =>
    apiRequest<LoginUrls>("/api/v1/auth/login-urls", { authenticated: false }),

  exchangeLoginCode: (code: string) =>
    apiRequest<TokenResponse>("/api/v1/auth/exchange", {
      authenticated: false,
      method: "POST",
      body: JSON.stringify({ code }),
    }),

  getCurrentUser: () => apiRequest<AuthUser>("/api/v1/auth/user"),

  async logout() {
    try {
      await apiRequest<void>("/api/v1/auth/logout", { method: "POST" });
    } finally {
      tokenStorage.clear();
    }
  },

  async withdraw() {
    try {
      await apiRequest<void>("/api/v1/auth/withdraw", { method: "DELETE" });
    } finally {
      tokenStorage.clear();
    }
  },
};
