import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, AUTH_EXPIRED_EVENT, apiRequest, authApi } from "./api";
import { tokenStorage } from "./tokenStorage";

function jsonResponse(data: unknown, status = 200) {
  return new Response(
    JSON.stringify({
      statusCode: status,
      data: status < 400 ? data : null,
      error: status >= 400 ? data : undefined,
    }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    },
  );
}

describe("authenticated API regression", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("sends location and marketing preferences in a profile PATCH", async () => {
    tokenStorage.setTokens({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      tokenType: "Bearer",
      isNewUser: false,
    });
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ locationEnabled: true, marketingEnabled: false }),
    );

    await authApi.updateProfile({
      locationEnabled: true,
      marketingEnabled: false,
    });

    const [url, request] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/api/v1/auth/user");
    expect(request).toMatchObject({
      method: "PATCH",
      body: JSON.stringify({
        locationEnabled: true,
        marketingEnabled: false,
      }),
    });
    expect(new Headers(request.headers).get("Authorization")).toBe(
      "Bearer access-token",
    );
  });

  it("refreshes an expired access token and retries the original request", async () => {
    tokenStorage.setTokens({
      accessToken: "expired-access",
      refreshToken: "valid-refresh",
      tokenType: "Bearer",
      isNewUser: false,
    });
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({ code: "AUTH_401", message: "expired" }, 401),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          accessToken: "renewed-access",
          refreshToken: "renewed-refresh",
          tokenType: "Bearer",
          isNewUser: false,
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ ok: true }));

    await expect(apiRequest<{ ok: boolean }>("/api/v1/test")).resolves.toEqual({
      ok: true,
    });

    expect(String(fetchMock.mock.calls[1][0])).toContain("/api/v1/auth/refresh");
    expect(fetchMock.mock.calls[1][1]).toMatchObject({
      method: "POST",
      body: JSON.stringify({ refreshToken: "valid-refresh" }),
    });
    expect(
      new Headers(fetchMock.mock.calls[2][1].headers).get("Authorization"),
    ).toBe("Bearer renewed-access");
    expect(tokenStorage.getRefreshToken()).toBe("renewed-refresh");
  });

  it("clears the session and emits auth expiry when refresh fails", async () => {
    tokenStorage.setTokens({
      accessToken: "expired-access",
      refreshToken: "invalid-refresh",
      tokenType: "Bearer",
      isNewUser: false,
    });
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({ code: "AUTH_401", message: "expired" }, 401),
      )
      .mockResolvedValueOnce(
        jsonResponse(
          { code: "AUTH_REFRESH_INVALID", message: "invalid" },
          401,
        ),
      );
    const expired = vi.fn();
    window.addEventListener(AUTH_EXPIRED_EVENT, expired, { once: true });

    await expect(apiRequest("/api/v1/test")).rejects.toBeInstanceOf(ApiError);

    expect(tokenStorage.getAccessToken()).toBeNull();
    expect(tokenStorage.getRefreshToken()).toBeNull();
    expect(expired).toHaveBeenCalledOnce();
  });
});
