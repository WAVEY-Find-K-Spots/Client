import { describe, expect, it } from "vitest";
import { formatNotificationTime } from "./format";

const now = new Date("2026-09-28T12:00:00.000Z").getTime();

const ko = {
  justNow: "방금 전",
  minutesAgo: (value: number) => `${value}분 전`,
  hoursAgo: (value: number) => `${value}시간 전`,
  daysAgo: (value: number) => `${value}일 전`,
};

const en = {
  justNow: "Just now",
  minutesAgo: (value: number) => `${value}m ago`,
  hoursAgo: (value: number) => `${value}h ago`,
  daysAgo: (value: number) => `${value}d ago`,
};

describe("formatNotificationTime", () => {
  it("formats recent notifications with the selected language", () => {
    expect(
      formatNotificationTime("2026-09-28T11:59:30.000Z", "ko", ko, now),
    ).toBe("방금 전");
    expect(
      formatNotificationTime("2026-09-28T11:55:00.000Z", "en", en, now),
    ).toBe("5m ago");
  });

  it("formats hour and day ranges", () => {
    expect(
      formatNotificationTime("2026-09-28T09:00:00.000Z", "ko", ko, now),
    ).toBe("3시간 전");
    expect(
      formatNotificationTime("2026-09-26T12:00:00.000Z", "en", en, now),
    ).toBe("2d ago");
  });

  it("uses the locale-specific calendar format after one week", () => {
    const koDate = formatNotificationTime(
      "2026-09-01T12:00:00.000Z",
      "ko",
      ko,
      now,
    );
    const enDate = formatNotificationTime(
      "2026-09-01T12:00:00.000Z",
      "en",
      en,
      now,
    );

    expect(koDate).toContain("9월");
    expect(enDate).toContain("Sep");
  });
});
