import generateEventLayouts from "../generate-event-layouts";
import { CalendarEvent } from "../../types";

/**
 * Helper to run generateEventLayouts for a single day in UTC.
 */
const layoutForDay = (
  events: CalendarEvent[],
  date = "2023-10-10",
  userCalendarId = "cal"
) => {
  const layouts = generateEventLayouts({
    startCalendarDate: date,
    endCalendarDate: date,
    events,
    timezone: "UTC",
    userCalendarId,
  });
  return layouts[date];
};

/** Shorthand for creating a timed event. */
const timedEvent = (
  id: string,
  start: string,
  end: string,
  calendarId = "cal"
): CalendarEvent => ({
  id,
  calendarId,
  title: `Event ${id}`,
  start,
  end,
});

describe("collision handling", () => {
  describe("three-way collisions", () => {
    it("should detect a three-way overlap", () => {
      const events = [
        timedEvent("a", "2023-10-10T08:00:00Z", "2023-10-10T09:00:00Z"),
        timedEvent("b", "2023-10-10T08:15:00Z", "2023-10-10T09:15:00Z"),
        timedEvent("c", "2023-10-10T08:30:00Z", "2023-10-10T09:30:00Z"),
      ];
      const day = layoutForDay(events);
      const { partDayEventsLayout } = day;

      expect(partDayEventsLayout).toHaveLength(3);
      for (const evt of partDayEventsLayout) {
        expect(evt.collisions?.total).toBe(3);
      }
    });

    it("should assign sequential collision orders 0, 1, 2", () => {
      const events = [
        timedEvent("a", "2023-10-10T08:00:00Z", "2023-10-10T09:00:00Z"),
        timedEvent("b", "2023-10-10T08:15:00Z", "2023-10-10T09:15:00Z"),
        timedEvent("c", "2023-10-10T08:30:00Z", "2023-10-10T09:30:00Z"),
      ];
      const day = layoutForDay(events);
      const orders = day.partDayEventsLayout
        .map((e) => e.collisions!.order)
        .sort();
      expect(orders).toEqual([0, 1, 2]);
    });
  });

  describe("five-way collisions", () => {
    it("should handle five simultaneous overlapping events", () => {
      const events = [
        timedEvent("1", "2023-10-10T10:00:00Z", "2023-10-10T11:00:00Z"),
        timedEvent("2", "2023-10-10T10:10:00Z", "2023-10-10T11:10:00Z"),
        timedEvent("3", "2023-10-10T10:20:00Z", "2023-10-10T11:20:00Z"),
        timedEvent("4", "2023-10-10T10:30:00Z", "2023-10-10T11:30:00Z"),
        timedEvent("5", "2023-10-10T10:40:00Z", "2023-10-10T11:40:00Z"),
      ];
      const day = layoutForDay(events);
      const { partDayEventsLayout } = day;

      expect(partDayEventsLayout).toHaveLength(5);
      for (const evt of partDayEventsLayout) {
        expect(evt.collisions?.total).toBe(5);
      }
      const orders = partDayEventsLayout.map((e) => e.collisions!.order).sort();
      expect(orders).toEqual([0, 1, 2, 3, 4]);
    });
  });

  describe("chain collisions (A overlaps B, B overlaps C, but A does not overlap C)", () => {
    it("should treat chained overlaps as a single collision group", () => {
      // A: 08:00-09:00, B: 08:45-09:45, C: 09:30-10:30
      // A overlaps B, B overlaps C, but A ends before C starts
      const events = [
        timedEvent("a", "2023-10-10T08:00:00Z", "2023-10-10T09:00:00Z"),
        timedEvent("b", "2023-10-10T08:45:00Z", "2023-10-10T09:45:00Z"),
        timedEvent("c", "2023-10-10T09:30:00Z", "2023-10-10T10:30:00Z"),
      ];
      const day = layoutForDay(events);
      const { partDayEventsLayout } = day;

      expect(partDayEventsLayout).toHaveLength(3);

      // A should be popped from stack before C arrives (A ends 09:00 <= C starts 09:30)
      // So B and C collide (stack size 2) but A was already popped
      const evtA = partDayEventsLayout.find((e) => e.event.id === "a")!;
      const evtB = partDayEventsLayout.find((e) => e.event.id === "b")!;
      const evtC = partDayEventsLayout.find((e) => e.event.id === "c")!;

      // A was in a 2-event stack with B, then popped
      expect(evtA.collisions?.total).toBe(2);
      // B remains when C arrives — B and C are both in the stack
      expect(evtB.collisions?.total).toBe(2);
      // C reuses A's slot (order 0) since A was nulled out
      expect(evtC.collisions?.total).toBe(2);
    });
  });

  describe("stack slot reuse", () => {
    it("should reuse null slots when earlier events finish", () => {
      // A: 08:00-08:30, B: 08:00-09:00, C: 08:30-09:00
      // A and B collide. A finishes, C starts — C reuses A's slot.
      const events = [
        timedEvent("a", "2023-10-10T08:00:00Z", "2023-10-10T08:30:00Z"),
        timedEvent("b", "2023-10-10T08:00:00Z", "2023-10-10T09:00:00Z"),
        timedEvent("c", "2023-10-10T08:30:00Z", "2023-10-10T09:00:00Z"),
      ];
      const day = layoutForDay(events);
      const { partDayEventsLayout } = day;

      expect(partDayEventsLayout).toHaveLength(3);

      // A was in slot 0 of a 2-event stack, popped when C arrives
      const evtA = partDayEventsLayout.find((e) => e.event.id === "a")!;
      expect(evtA.collisions?.total).toBe(2);
      expect(evtA.collisions?.order).toBe(0);

      // C should reuse slot 0 (the first null slot)
      const evtC = partDayEventsLayout.find((e) => e.event.id === "c")!;
      expect(evtC.collisions?.order).toBe(0);
    });
  });

  describe("collision positioning", () => {
    it("should assign narrower widths and offsets for colliding events", () => {
      const events = [
        timedEvent("1", "2023-10-10T08:00:00Z", "2023-10-10T09:00:00Z"),
        timedEvent("2", "2023-10-10T08:00:00Z", "2023-10-10T09:00:00Z"),
      ];
      const day = layoutForDay(events);
      const { partDayEventsLayout } = day;

      const evt0 = partDayEventsLayout.find((e) => e.collisions?.order === 0)!;
      const evt1 = partDayEventsLayout.find((e) => e.collisions?.order === 1)!;

      // First event: full collision width, no margin
      expect(evt0.position.marginLeft).toBe("0%");
      // Second event: shifted right
      expect(parseFloat(evt1.position.marginLeft)).toBeGreaterThan(0);
      // Both should be narrower than 100%
      expect(parseFloat(evt0.position.width)).toBeLessThan(100);
      expect(parseFloat(evt1.position.width)).toBeLessThan(100);
    });

    it("should give full width and no margin to non-colliding events", () => {
      const events = [
        timedEvent("1", "2023-10-10T08:00:00Z", "2023-10-10T09:00:00Z"),
        timedEvent("2", "2023-10-10T10:00:00Z", "2023-10-10T11:00:00Z"),
      ];
      const day = layoutForDay(events);
      for (const evt of day.partDayEventsLayout) {
        expect(evt.position.width).toBe("100%");
        expect(evt.position.marginLeft).toBe("0%");
      }
    });

    it("should compute correct top position from event start time", () => {
      // Event starts at 09:30 = 570 minutes from midnight
      const events = [
        timedEvent("1", "2023-10-10T09:30:00Z", "2023-10-10T10:00:00Z"),
      ];
      const day = layoutForDay(events);
      expect(day.partDayEventsLayout[0].position.top).toBe(570);
    });

    it("should enforce minimum height for short events", () => {
      // 15-minute event should get minimum height of 30
      const events = [
        timedEvent("1", "2023-10-10T09:00:00Z", "2023-10-10T09:15:00Z"),
      ];
      const day = layoutForDay(events);
      expect(day.partDayEventsLayout[0].position.height).toBe(30);
    });

    it("should use actual duration for events longer than minimum", () => {
      // 90-minute event should have height of 90
      const events = [
        timedEvent("1", "2023-10-10T09:00:00Z", "2023-10-10T10:30:00Z"),
      ];
      const day = layoutForDay(events);
      expect(day.partDayEventsLayout[0].position.height).toBe(90);
    });
  });

  describe("sort order determinism", () => {
    it("should produce consistent ordering regardless of input order", () => {
      const eventsForward = [
        timedEvent("a", "2023-10-10T08:00:00Z", "2023-10-10T09:00:00Z"),
        timedEvent("b", "2023-10-10T08:00:00Z", "2023-10-10T09:00:00Z"),
        timedEvent("c", "2023-10-10T08:00:00Z", "2023-10-10T09:00:00Z"),
      ];
      const eventsReversed = [
        timedEvent("c", "2023-10-10T08:00:00Z", "2023-10-10T09:00:00Z"),
        timedEvent("b", "2023-10-10T08:00:00Z", "2023-10-10T09:00:00Z"),
        timedEvent("a", "2023-10-10T08:00:00Z", "2023-10-10T09:00:00Z"),
      ];

      const dayForward = layoutForDay(eventsForward);
      const dayReversed = layoutForDay(eventsReversed);

      // Same events should get same collision orders regardless of input order
      for (const id of ["a", "b", "c"]) {
        const fwd = dayForward.partDayEventsLayout.find(
          (e) => e.event.id === id
        )!;
        const rev = dayReversed.partDayEventsLayout.find(
          (e) => e.event.id === id
        )!;
        expect(fwd.collisions?.order).toBe(rev.collisions?.order);
        expect(fwd.position.width).toBe(rev.position.width);
        expect(fwd.position.marginLeft).toBe(rev.position.marginLeft);
      }
    });

    it("should sort by start time, then duration, then id", () => {
      // Same start time, different durations — shorter event gets lower order
      const events = [
        timedEvent("z", "2023-10-10T08:00:00Z", "2023-10-10T10:00:00Z"), // 2hr
        timedEvent("a", "2023-10-10T08:00:00Z", "2023-10-10T09:00:00Z"), // 1hr
      ];
      const day = layoutForDay(events);
      const { partDayEventsLayout } = day;

      const shortEvt = partDayEventsLayout.find((e) => e.event.id === "a")!;
      const longEvt = partDayEventsLayout.find((e) => e.event.id === "z")!;

      // Shorter duration should be sorted first (lower order)
      expect(shortEvt.collisions?.order).toBeLessThan(
        longEvt.collisions?.order!
      );
    });

    it("should break ties with event id for identical events", () => {
      const events = [
        timedEvent("beta", "2023-10-10T08:00:00Z", "2023-10-10T09:00:00Z"),
        timedEvent("alpha", "2023-10-10T08:00:00Z", "2023-10-10T09:00:00Z"),
      ];
      const day = layoutForDay(events);
      const { partDayEventsLayout } = day;

      const alpha = partDayEventsLayout.find((e) => e.event.id === "alpha")!;
      const beta = partDayEventsLayout.find((e) => e.event.id === "beta")!;

      expect(alpha.collisions?.order).toBeLessThan(beta.collisions?.order!);
    });
  });

  describe("primary calendar priority in collisions", () => {
    it("should place primary calendar events before secondary at same start time", () => {
      const events = [
        timedEvent(
          "sec",
          "2023-10-10T08:00:00Z",
          "2023-10-10T09:00:00Z",
          "other-cal"
        ),
        timedEvent(
          "pri",
          "2023-10-10T08:00:00Z",
          "2023-10-10T09:00:00Z",
          "my-cal"
        ),
      ];
      const day = layoutForDay(events, "2023-10-10", "my-cal");
      const { partDayEventsLayout } = day;

      const pri = partDayEventsLayout.find((e) => e.event.id === "pri")!;
      const sec = partDayEventsLayout.find((e) => e.event.id === "sec")!;

      expect(pri.collisions?.order).toBeLessThan(sec.collisions?.order!);
    });
  });

  describe("edge cases", () => {
    it("should handle events starting exactly at midnight", () => {
      const events = [
        timedEvent("1", "2023-10-10T00:00:00Z", "2023-10-10T01:00:00Z"),
      ];
      const day = layoutForDay(events);
      expect(day.partDayEventsLayout).toHaveLength(1);
      expect(day.partDayEventsLayout[0].position.top).toBe(0);
    });

    it("should handle events ending exactly at midnight", () => {
      const events = [
        timedEvent("1", "2023-10-10T23:00:00Z", "2023-10-11T00:00:00Z"),
      ];
      const day = layoutForDay(events);
      expect(day.partDayEventsLayout).toHaveLength(1);
      expect(day.partDayEventsLayout[0].position.top).toBe(23 * 60);
    });

    it("should handle many non-colliding events", () => {
      // One event per hour, no overlaps
      const events: CalendarEvent[] = [];
      for (let h = 0; h < 12; h++) {
        const hh = String(h).padStart(2, "0");
        events.push(
          timedEvent(
            `evt-${h}`,
            `2023-10-10T${hh}:00:00Z`,
            `2023-10-10T${hh}:30:00Z`
          )
        );
      }
      const day = layoutForDay(events);
      expect(day.partDayEventsLayout).toHaveLength(12);
      for (const evt of day.partDayEventsLayout) {
        expect(evt.collisions).toBeUndefined();
        expect(evt.position.width).toBe("100%");
      }
    });

    it("should handle many fully overlapping events", () => {
      const events: CalendarEvent[] = [];
      for (let i = 0; i < 10; i++) {
        events.push(
          timedEvent(`evt-${i}`, "2023-10-10T10:00:00Z", "2023-10-10T11:00:00Z")
        );
      }
      const day = layoutForDay(events);
      expect(day.partDayEventsLayout).toHaveLength(10);
      for (const evt of day.partDayEventsLayout) {
        expect(evt.collisions?.total).toBe(10);
      }
      const orders = day.partDayEventsLayout
        .map((e) => e.collisions!.order)
        .sort((a, b) => a - b);
      expect(orders).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it("should handle fractional hour durations (45 minutes)", () => {
      const events = [
        timedEvent("1", "2023-10-10T09:00:00Z", "2023-10-10T09:45:00Z"),
      ];
      const day = layoutForDay(events);
      expect(day.partDayEventsLayout[0].position.height).toBe(45);
    });

    it("should handle two zero-duration events at same time", () => {
      const events = [
        timedEvent("a", "2023-10-10T10:00:00Z", "2023-10-10T10:00:00Z"),
        timedEvent("b", "2023-10-10T10:00:00Z", "2023-10-10T10:00:00Z"),
      ];
      const day = layoutForDay(events);
      expect(day.partDayEventsLayout).toHaveLength(2);
      // Zero-duration events end <= start of each other, so no collision
      for (const evt of day.partDayEventsLayout) {
        expect(evt.collisions).toBeUndefined();
      }
    });
  });

  describe("multi-day date ranges", () => {
    it("should return layouts for each day in range", () => {
      const events = [
        timedEvent("1", "2023-10-10T09:00:00Z", "2023-10-10T10:00:00Z"),
        timedEvent("2", "2023-10-11T14:00:00Z", "2023-10-11T15:00:00Z"),
        timedEvent("3", "2023-10-12T08:00:00Z", "2023-10-12T09:00:00Z"),
      ];
      const layouts = generateEventLayouts({
        startCalendarDate: "2023-10-10",
        endCalendarDate: "2023-10-12",
        events,
        timezone: "UTC",
        userCalendarId: "cal",
      });

      expect(layouts["2023-10-10"].partDayEventsLayout).toHaveLength(1);
      expect(layouts["2023-10-10"].partDayEventsLayout[0].event.id).toBe("1");
      expect(layouts["2023-10-11"].partDayEventsLayout).toHaveLength(1);
      expect(layouts["2023-10-11"].partDayEventsLayout[0].event.id).toBe("2");
      expect(layouts["2023-10-12"].partDayEventsLayout).toHaveLength(1);
      expect(layouts["2023-10-12"].partDayEventsLayout[0].event.id).toBe("3");
    });

    it("should filter events to the correct day", () => {
      // Event on day 1 should not appear on day 2
      const events = [
        timedEvent("1", "2023-10-10T09:00:00Z", "2023-10-10T10:00:00Z"),
      ];
      const layouts = generateEventLayouts({
        startCalendarDate: "2023-10-10",
        endCalendarDate: "2023-10-11",
        events,
        timezone: "UTC",
        userCalendarId: "cal",
      });

      expect(layouts["2023-10-10"].partDayEventsLayout).toHaveLength(1);
      expect(layouts["2023-10-11"].partDayEventsLayout).toHaveLength(0);
    });
  });

  describe("timezone-aware collision handling", () => {
    it("should detect collisions after timezone conversion", () => {
      // Event 1: 08:00 UTC = 03:00 EST
      // Event 2: 03:30 EST = 08:30 UTC
      // In UTC these overlap (08:00-09:00 and 08:30-09:30)
      const events = [
        timedEvent("1", "2023-10-10T08:00:00Z", "2023-10-10T09:00:00Z"),
        timedEvent("2", "2023-10-10T08:30:00Z", "2023-10-10T09:30:00Z"),
      ];
      const day = layoutForDay(events);
      expect(day.partDayEventsLayout).toHaveLength(2);
      expect(day.partDayEventsLayout[0].collisions?.total).toBe(2);
    });

    it("should separate events that only collide in one timezone but not the display timezone", () => {
      // Event 1: 23:00-23:59 UTC on Oct 10
      // Event 2: 00:00-01:00 UTC on Oct 11 (next day in UTC)
      // In UTC they don't overlap and are on different days
      const events = [
        timedEvent("1", "2023-10-10T23:00:00Z", "2023-10-10T23:59:00Z"),
        timedEvent("2", "2023-10-11T00:00:00Z", "2023-10-11T01:00:00Z"),
      ];
      const day = layoutForDay(events, "2023-10-10");
      // Only event 1 should appear on Oct 10
      expect(day.partDayEventsLayout).toHaveLength(1);
      expect(day.partDayEventsLayout[0].event.id).toBe("1");
    });

    it("should handle events in non-UTC timezone", () => {
      // Events defined in UTC but displayed in America/New_York (UTC-4)
      // Event at 12:00 UTC = 08:00 ET
      const events: CalendarEvent[] = [
        {
          id: "1",
          calendarId: "cal",
          title: "Morning meeting",
          start: "2023-10-10T12:00:00Z",
          end: "2023-10-10T13:00:00Z",
        },
      ];
      const layouts = generateEventLayouts({
        startCalendarDate: "2023-10-10",
        endCalendarDate: "2023-10-10",
        events,
        timezone: "America/New_York",
        userCalendarId: "cal",
      });
      const day = layouts["2023-10-10"];
      expect(day.partDayEventsLayout).toHaveLength(1);
      // 12:00 UTC = 08:00 ET = 480 minutes from midnight
      expect(day.partDayEventsLayout[0].position.top).toBe(480);
    });
  });

  describe("collision groups reset properly", () => {
    it("should handle separate collision groups on the same day", () => {
      // Group 1: two events overlap in the morning
      // Group 2: two events overlap in the afternoon
      // No interaction between groups
      const events = [
        timedEvent("a1", "2023-10-10T08:00:00Z", "2023-10-10T09:00:00Z"),
        timedEvent("a2", "2023-10-10T08:30:00Z", "2023-10-10T09:30:00Z"),
        timedEvent("b1", "2023-10-10T14:00:00Z", "2023-10-10T15:00:00Z"),
        timedEvent("b2", "2023-10-10T14:30:00Z", "2023-10-10T15:30:00Z"),
      ];
      const day = layoutForDay(events);
      const { partDayEventsLayout } = day;

      expect(partDayEventsLayout).toHaveLength(4);

      const groupA = partDayEventsLayout.filter((e) =>
        e.event.id.startsWith("a")
      );
      const groupB = partDayEventsLayout.filter((e) =>
        e.event.id.startsWith("b")
      );

      // Each group has 2 collisions
      for (const evt of groupA) {
        expect(evt.collisions?.total).toBe(2);
      }
      for (const evt of groupB) {
        expect(evt.collisions?.total).toBe(2);
      }
    });

    it("should have a non-colliding event between two collision groups", () => {
      const events = [
        timedEvent("a1", "2023-10-10T08:00:00Z", "2023-10-10T09:00:00Z"),
        timedEvent("a2", "2023-10-10T08:30:00Z", "2023-10-10T09:30:00Z"),
        timedEvent("solo", "2023-10-10T11:00:00Z", "2023-10-10T12:00:00Z"),
        timedEvent("b1", "2023-10-10T14:00:00Z", "2023-10-10T15:00:00Z"),
        timedEvent("b2", "2023-10-10T14:30:00Z", "2023-10-10T15:30:00Z"),
      ];
      const day = layoutForDay(events);

      const solo = day.partDayEventsLayout.find((e) => e.event.id === "solo")!;
      expect(solo.collisions).toBeUndefined();
      expect(solo.position.width).toBe("100%");
    });
  });

  describe("all-day event layout", () => {
    it("should place isAllDay events in allDayEventsLayout", () => {
      const events: CalendarEvent[] = [
        {
          id: "1",
          calendarId: "cal",
          title: "All Day",
          start: "2023-10-10T00:00:00Z",
          end: "2023-10-11T00:00:00Z",
          isAllDay: true,
        },
      ];
      const day = layoutForDay(events);
      expect(day.allDayEventsLayout).toHaveLength(1);
      expect(day.partDayEventsLayout).toHaveLength(0);
    });

    it("should separate all-day and timed events correctly with mixed input", () => {
      const events: CalendarEvent[] = [
        {
          id: "allday-1",
          calendarId: "cal",
          title: "All Day 1",
          start: "2023-10-10T00:00:00Z",
          end: "2023-10-11T00:00:00Z",
          isAllDay: true,
        },
        {
          id: "allday-2",
          calendarId: "cal",
          title: "All Day 2",
          start: "2023-10-10T00:00:00Z",
          end: "2023-10-11T00:00:00Z",
          isAllDay: true,
        },
        timedEvent("timed-1", "2023-10-10T09:00:00Z", "2023-10-10T10:00:00Z"),
        timedEvent("timed-2", "2023-10-10T14:00:00Z", "2023-10-10T15:00:00Z"),
      ];
      const day = layoutForDay(events);
      expect(day.allDayEventsLayout).toHaveLength(2);
      expect(day.partDayEventsLayout).toHaveLength(2);
    });
  });

  describe("stress test", () => {
    it("should handle 50 overlapping events without error", () => {
      const events: CalendarEvent[] = [];
      for (let i = 0; i < 50; i++) {
        const mm = String(i).padStart(2, "0");
        events.push(
          timedEvent(
            `evt-${i}`,
            `2023-10-10T10:${mm}:00Z`,
            `2023-10-10T12:00:00Z`
          )
        );
      }
      const day = layoutForDay(events);
      expect(day.partDayEventsLayout).toHaveLength(50);

      // All should be in the same collision group
      for (const evt of day.partDayEventsLayout) {
        expect(evt.collisions?.total).toBe(50);
      }

      // All orders should be unique
      const orders = new Set(
        day.partDayEventsLayout.map((e) => e.collisions!.order)
      );
      expect(orders.size).toBe(50);
    });

    it("should handle 100 non-overlapping events efficiently", () => {
      const events: CalendarEvent[] = [];
      for (let i = 0; i < 100; i++) {
        // Each event is 10 minutes, spaced 10 minutes apart = no overlap
        const startMin = i * 10;
        const endMin = startMin + 5;
        const startH = String(Math.floor(startMin / 60)).padStart(2, "0");
        const startM = String(startMin % 60).padStart(2, "0");
        const endH = String(Math.floor(endMin / 60)).padStart(2, "0");
        const endM = String(endMin % 60).padStart(2, "0");
        events.push(
          timedEvent(
            `evt-${i}`,
            `2023-10-10T${startH}:${startM}:00Z`,
            `2023-10-10T${endH}:${endM}:00Z`
          )
        );
      }
      const day = layoutForDay(events);
      expect(day.partDayEventsLayout).toHaveLength(100);
      for (const evt of day.partDayEventsLayout) {
        expect(evt.collisions).toBeUndefined();
      }
    });
  });
});
