import { beforeEach, describe, expect, it, vi } from "vitest";
import { notificationsApi } from "./notifications-api";

function jsonResponse(data: unknown) {
  return new Response(JSON.stringify({ statusCode: 200, data }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("notificationsApi", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("requests the localized inbox with pagination", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        unreadCount: 0,
        notifications: [],
        page: 2,
        size: 10,
        totalElements: 0,
        totalPages: 0,
        hasNext: false,
      }),
    );

    await notificationsApi.getInbox({ language: "en", page: 2, size: 10 });

    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toContain(
      "/api/v1/me/notifications?language=en&page=2&size=10",
    );
  });

  it("uses PATCH for individual and bulk read operations", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ id: 7, read: true }))
      .mockResolvedValueOnce(jsonResponse(3));

    await notificationsApi.markRead(7, "ko");
    await notificationsApi.markAllRead();

    expect(String(fetchMock.mock.calls[0][0])).toContain(
      "/api/v1/me/notifications/7/read?language=ko",
    );
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: "PATCH" });
    expect(String(fetchMock.mock.calls[1][0])).toContain(
      "/api/v1/me/notifications/read-all",
    );
    expect(fetchMock.mock.calls[1][1]).toMatchObject({ method: "PATCH" });
  });

  it("loads and partially updates notification settings", async () => {
    const settings = {
      pushEnabled: true,
      stampEnabled: true,
      routeEnabled: true,
      spotEnabled: true,
      noticeEnabled: true,
    };
    fetchMock
      .mockResolvedValueOnce(jsonResponse(settings))
      .mockResolvedValueOnce(jsonResponse({ ...settings, noticeEnabled: false }));

    await notificationsApi.getSettings();
    await notificationsApi.updateSettings({ noticeEnabled: false });

    expect(String(fetchMock.mock.calls[0][0])).toContain(
      "/api/v1/me/notifications/settings",
    );
    expect(String(fetchMock.mock.calls[1][0])).toContain(
      "/api/v1/me/notifications/settings",
    );
    expect(fetchMock.mock.calls[1][1]).toMatchObject({
      method: "PATCH",
      body: JSON.stringify({ noticeEnabled: false }),
    });
  });
});
