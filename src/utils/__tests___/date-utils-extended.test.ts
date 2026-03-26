import moment from "moment-timezone";
import {
  dateRangeIntersect,
  getDuration,
  getDurationInDays,
  isAllDayOrSpansMidnight,
  daysInRange,
  startOfUserWeek,
  computeCalendarDateRange,
} from "../date-utils";
import { CalendarEvent } from "../../types";

const event = (
  start: string,
  end: string,
  isAllDay = false
): CalendarEvent => ({
  id: "test",
  calendarId: "cal",
  title: "Test",
  start,
  end,
  isAllDay,
});

describe("dateRangeIntersect", () => {
  const d = (iso: string) => new Date(iso);

  it("should return true for overlapping ranges", () => {
    expect(
      dateRangeIntersect(
        {
          startDate: d("2023-01-01T08:00:00Z"),
          endDate: d("2023-01-01T10:00:00Z"),
        },
        {
          startDate: d("2023-01-01T09:00:00Z"),
          endDate: d("2023-01-01T11:00:00Z"),
        }
      )
    ).toBe(true);
  });

  it("should return true when one range contains the other", () => {
    expect(
      dateRangeIntersect(
        {
          startDate: d("2023-01-01T08:00:00Z"),
          endDate: d("2023-01-01T12:00:00Z"),
        },
        {
          startDate: d("2023-01-01T09:00:00Z"),
          endDate: d("2023-01-01T11:00:00Z"),
        }
      )
    ).toBe(true);
  });

  it("should return false for non-overlapping ranges", () => {
    expect(
      dateRangeIntersect(
        {
          startDate: d("2023-01-01T08:00:00Z"),
          endDate: d("2023-01-01T09:00:00Z"),
        },
        {
          startDate: d("2023-01-01T10:00:00Z"),
          endDate: d("2023-01-01T11:00:00Z"),
        }
      )
    ).toBe(false);
  });

  it("should return false for touching ranges (half-open interval)", () => {
    // [08:00, 09:00) and [09:00, 10:00) — touching at boundary should NOT intersect
    expect(
      dateRangeIntersect(
        {
          startDate: d("2023-01-01T08:00:00Z"),
          endDate: d("2023-01-01T09:00:00Z"),
        },
        {
          startDate: d("2023-01-01T09:00:00Z"),
          endDate: d("2023-01-01T10:00:00Z"),
        }
      )
    ).toBe(false);
  });

  it("should return true for identical ranges", () => {
    expect(
      dateRangeIntersect(
        {
          startDate: d("2023-01-01T08:00:00Z"),
          endDate: d("2023-01-01T09:00:00Z"),
        },
        {
          startDate: d("2023-01-01T08:00:00Z"),
          endDate: d("2023-01-01T09:00:00Z"),
        }
      )
    ).toBe(true);
  });

  it("should return false for inverted range (start > end)", () => {
    expect(
      dateRangeIntersect(
        {
          startDate: d("2023-01-01T10:00:00Z"),
          endDate: d("2023-01-01T08:00:00Z"),
        },
        {
          startDate: d("2023-01-01T09:00:00Z"),
          endDate: d("2023-01-01T11:00:00Z"),
        }
      )
    ).toBe(false);
  });

  it("should throw for non-Date arguments", () => {
    expect(() =>
      dateRangeIntersect(
        { startDate: "not-a-date" as any, endDate: d("2023-01-01T09:00:00Z") },
        {
          startDate: d("2023-01-01T08:00:00Z"),
          endDate: d("2023-01-01T10:00:00Z"),
        }
      )
    ).toThrow();
  });

  it("should return true when ranges overlap by 1 millisecond", () => {
    expect(
      dateRangeIntersect(
        {
          startDate: d("2023-01-01T08:00:00.000Z"),
          endDate: d("2023-01-01T09:00:00.001Z"),
        },
        {
          startDate: d("2023-01-01T09:00:00.000Z"),
          endDate: d("2023-01-01T10:00:00.000Z"),
        }
      )
    ).toBe(true);
  });
});

describe("isAllDayOrSpansMidnight", () => {
  it("should return true for isAllDay events", () => {
    const evt = event("2023-01-01T00:00:00Z", "2023-01-02T00:00:00Z", true);
    expect(isAllDayOrSpansMidnight(evt, "UTC")).toBe(true);
  });

  it("should return false for same-day events", () => {
    const evt = event("2023-01-01T08:00:00Z", "2023-01-01T17:00:00Z");
    expect(isAllDayOrSpansMidnight(evt, "UTC")).toBe(false);
  });

  it("should return true for events spanning midnight", () => {
    const evt = event("2023-01-01T22:00:00Z", "2023-01-02T02:00:00Z");
    expect(isAllDayOrSpansMidnight(evt, "UTC")).toBe(true);
  });

  it("should return false for events ending exactly at midnight", () => {
    // Special case: ending at 00:00 next day is treated as same-day
    const evt = event("2023-01-01T22:00:00Z", "2023-01-02T00:00:00Z");
    expect(isAllDayOrSpansMidnight(evt, "UTC")).toBe(false);
  });

  it("should respect timezone when checking midnight", () => {
    // 23:00 UTC to 01:00 UTC next day spans midnight in UTC
    // but in UTC-5, this is 18:00 to 20:00 — same day
    const evt = event("2023-01-01T23:00:00Z", "2023-01-02T01:00:00Z");
    expect(isAllDayOrSpansMidnight(evt, "UTC")).toBe(true);
    expect(isAllDayOrSpansMidnight(evt, "America/New_York")).toBe(false);
  });
});

describe("getDuration", () => {
  it("should return duration in minutes", () => {
    const evt = event("2023-01-01T08:00:00Z", "2023-01-01T09:30:00Z");
    expect(getDuration(evt)).toBe(90);
  });

  it("should return 0 for zero-duration events", () => {
    const evt = event("2023-01-01T08:00:00Z", "2023-01-01T08:00:00Z");
    expect(getDuration(evt)).toBe(0);
  });

  it("should add extra 24 hours for all-day events by default", () => {
    const evt = event("2023-01-01T00:00:00Z", "2023-01-02T00:00:00Z", true);
    const baseDuration = 24 * 60; // 1440 minutes for 1 day
    const extraAllDay = 24 * 60 * 60; // extra padding for all-day
    expect(getDuration(evt)).toBe(baseDuration + extraAllDay);
  });

  it("should not add extra time for all-day events when trueDuration is true", () => {
    const evt = event("2023-01-01T00:00:00Z", "2023-01-02T00:00:00Z", true);
    expect(getDuration(evt, true)).toBe(24 * 60);
  });

  it("should handle fractional minutes", () => {
    // 30 seconds = 0.5 minutes
    const evt = event("2023-01-01T08:00:00Z", "2023-01-01T08:00:30Z");
    expect(getDuration(evt)).toBe(0.5);
  });
});

describe("getDurationInDays", () => {
  it("should return 1 for a single-day event", () => {
    const evt = event("2023-01-01T08:00:00Z", "2023-01-01T17:00:00Z");
    expect(getDurationInDays(evt, "UTC")).toBe(1);
  });

  it("should return 1 for an event spanning less than 24 hours across midnight", () => {
    // moment.diff("days") truncates, so 22:00-02:00 = 0 days diff → daysInRange returns 1
    const evt = event("2023-01-01T22:00:00Z", "2023-01-02T02:00:00Z");
    expect(getDurationInDays(evt, "UTC")).toBe(1);
  });

  it("should use day diff + 1 for all-day events", () => {
    const evt = event("2023-01-01T00:00:00Z", "2023-01-03T00:00:00Z", true);
    // diff is 2 days, +1 = 3
    expect(getDurationInDays(evt, "UTC")).toBe(3);
  });

  it("should respect timezone", () => {
    // 2023-01-01 23:00 UTC = 2023-01-01 18:00 EST
    // 2023-01-02 01:00 UTC = 2023-01-01 20:00 EST
    // moment.diff("days") truncates: 2h span = 0 days → daysInRange returns 1 for both
    const evt = event("2023-01-01T23:00:00Z", "2023-01-02T01:00:00Z");
    expect(getDurationInDays(evt, "UTC")).toBe(1);
    expect(getDurationInDays(evt, "America/New_York")).toBe(1);
  });

  it("should return 2 for a full-day-plus event spanning two calendar days", () => {
    // 25 hours: moment.diff("days") = 1, so daysInRange returns 2 entries
    const evt = event("2023-01-01T00:00:00Z", "2023-01-02T01:00:00Z");
    expect(getDurationInDays(evt, "UTC")).toBe(2);
  });
});

describe("daysInRange", () => {
  it("should return array of day strings for a date range", () => {
    const days = daysInRange({
      startDate: "2023-01-01T00:00:00Z",
      endDate: "2023-01-03T00:00:00Z",
      timezone: "UTC",
    });
    expect(days).toEqual(["2023-01-01", "2023-01-02", "2023-01-03"]);
  });

  it("should return single day for same-day range", () => {
    const days = daysInRange({
      startDate: "2023-01-01T08:00:00Z",
      endDate: "2023-01-01T17:00:00Z",
      timezone: "UTC",
    });
    expect(days).toEqual(["2023-01-01"]);
  });

  it("should cap at 31 days to prevent runaway loops", () => {
    const days = daysInRange({
      startDate: "2023-01-01T00:00:00Z",
      endDate: "2023-12-31T00:00:00Z",
      timezone: "UTC",
    });
    expect(days.length).toBe(31); // 0..30 inclusive
  });

  it("should respect timezone for day boundaries", () => {
    // 2023-01-02 01:00 UTC = 2023-01-01 20:00 EST
    const days = daysInRange({
      startDate: "2023-01-02T01:00:00Z",
      endDate: "2023-01-02T05:00:00Z",
      timezone: "America/New_York",
    });
    // In EST, this starts on Jan 1 at 20:00 and ends Jan 1 at 00:00
    expect(days[0]).toBe("2023-01-01");
  });
});

describe("startOfUserWeek", () => {
  it("should return Sunday for offset 0 on non-Sunday", () => {
    // 2023-10-11 is a Wednesday; isoWeek starts Monday (Oct 9), then isoWeekday(0) = Sunday (Oct 8)
    const result = startOfUserWeek(0, "2023-10-11", "UTC");
    expect(result.format("YYYY-MM-DD")).toBe("2023-10-08");
  });

  it("should return Sunday when offset is 0 and date is Sunday", () => {
    // 2023-10-15 is a Sunday
    const result = startOfUserWeek(0, "2023-10-15", "UTC");
    expect(result.format("YYYY-MM-DD")).toBe("2023-10-15");
  });

  it("should apply isoWeekday offset", () => {
    // 2023-10-11 is a Wednesday, isoWeek starts Monday (2023-10-09)
    // With offset 2 (Tuesday), should return the Tuesday of that week
    const result = startOfUserWeek(2, "2023-10-11", "UTC");
    expect(result.format("YYYY-MM-DD")).toBe("2023-10-10"); // Tuesday
  });
});

describe("computeCalendarDateRange", () => {
  it("should return single day for 1day view", () => {
    const result = computeCalendarDateRange("2023-10-10", "UTC", "1day", 0);
    expect(result.calendarDates).toEqual(["2023-10-10"]);
    expect(result.dayIndexes).toEqual([0]);
  });

  it("should return 3 days for 3day view", () => {
    const result = computeCalendarDateRange("2023-10-10", "UTC", "3day", 0);
    expect(result.calendarDates).toHaveLength(3);
    expect(result.calendarDates[0]).toBe("2023-10-10");
    expect(result.calendarDates[1]).toBe("2023-10-11");
    expect(result.calendarDates[2]).toBe("2023-10-12");
  });

  it("should return 7 days for week view", () => {
    const result = computeCalendarDateRange("2023-10-10", "UTC", "week", 0);
    expect(result.calendarDates).toHaveLength(7);
  });

  it("should return 5 weekdays for workweek view", () => {
    const result = computeCalendarDateRange("2023-10-10", "UTC", "workweek", 0);
    expect(result.calendarDates).toHaveLength(5);
    // All dates should be weekdays (Mon-Fri)
    for (const date of result.calendarDates) {
      const dayOfWeek = moment.tz(date, "UTC").day();
      expect(dayOfWeek).toBeGreaterThan(0); // not Sunday
      expect(dayOfWeek).toBeLessThan(6); // not Saturday
    }
  });

  it("should return correct date range for month view", () => {
    const result = computeCalendarDateRange("2023-10-15", "UTC", "month", 0);
    // October 2023 starts on Sunday, ends on Tuesday
    // Should include padding days to fill complete weeks
    expect(result.calendarDates.length).toBeGreaterThanOrEqual(28);
    expect(result.calendarDates.length).toBeLessThanOrEqual(42);
    // Should be a multiple of 7 (complete weeks)
    expect(result.calendarDates.length % 7).toBe(0);
  });

  it("should include startDate and endDate in the result", () => {
    const result = computeCalendarDateRange("2023-10-10", "UTC", "1day", 0);
    expect(result.startDate).toBeDefined();
    expect(result.endDate).toBeDefined();
    expect(result.startCalendarDate).toBe("2023-10-10");
    expect(result.endCalendarDate).toBe("2023-10-10");
  });
});
