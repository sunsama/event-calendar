import generateEventLayouts from "../generate-event-layouts";

describe("generateEventLayouts", () => {
  it("should separate all-day events and timed events", () => {
    const events: CalendarEvent[] = [
      {
        id: "1",
        calendarId: "primary-calendar",
        title: "All-Day Event",
        start: "2023-10-10T00:00:00Z",
        end: "2023-10-11T02:00:00Z",
        isAllDay: true,
      },
      {
        id: "2",
        calendarId: "primary-calendar",
        title: "Timed Event",
        start: "2023-10-10T08:30:00Z",
        end: "2023-10-10T09:30:00Z",
      },
    ];

    const layouts = generateEventLayouts({
      startCalendarDate: "2023-10-10",
      endCalendarDate: "2023-10-10",
      events,
      timezone: "UTC",
      userCalendarId: "primary-calendar",
    });

    const dayLayout = layouts["2023-10-10"];

    expect(dayLayout).toBeDefined();
    expect(dayLayout.allDayEventsLayout.length).toBe(1);
    expect(dayLayout.partDayEventsLayout.length).toBe(1);
    expect(dayLayout.allDayEventsLayout[0].event.id).toBe("1");
    expect(dayLayout.partDayEventsLayout[0].event.id).toBe("2");
  });

  it("should handle events with overlapping times", () => {
    const events: CalendarEvent[] = [
      {
        id: "1",
        calendarId: "primary-calendar",
        title: "Event 1",
        start: "2023-10-10T08:00:00Z",
        end: "2023-10-10T09:00:00Z",
      },
      {
        id: "2",
        calendarId: "primary-calendar",
        title: "Event 2",
        start: "2023-10-10T08:30:00Z",
        end: "2023-10-10T09:30:00Z",
      },
    ];

    const layouts = generateEventLayouts({
      startCalendarDate: "2023-10-10",
      endCalendarDate: "2023-10-10",
      events,
      timezone: "UTC",
      userCalendarId: "primary-calendar",
    });

    const dayLayout = layouts["2023-10-10"];
    expect(dayLayout).toBeDefined();
    const { partDayEventsLayout } = dayLayout;
    expect(partDayEventsLayout.length).toBe(2);
    // Overlapping events should have collisions.total = 2
    expect(partDayEventsLayout[0].collisions?.total).toBe(2);
    expect(partDayEventsLayout[1].collisions?.total).toBe(2);
  });

  it("should handle events with no overlap", () => {
    const events: CalendarEvent[] = [
      {
        id: "1",
        calendarId: "primary-calendar",
        title: "Event 1",
        start: "2023-10-10T08:00:00Z",
        end: "2023-10-10T09:00:00Z",
      },
      {
        id: "2",
        calendarId: "primary-calendar",
        title: "Event 2",
        start: "2023-10-10T09:30:00Z",
        end: "2023-10-10T10:30:00Z",
      },
    ];

    const layouts = generateEventLayouts({
      startCalendarDate: "2023-10-10",
      endCalendarDate: "2023-10-10",
      events,
      timezone: "UTC",
      userCalendarId: "primary-calendar",
    });

    const dayLayout = layouts["2023-10-10"];
    expect(dayLayout).toBeDefined();
    const { partDayEventsLayout } = dayLayout;
    expect(partDayEventsLayout.length).toBe(2);
    expect(partDayEventsLayout[0].collisions).toBe(undefined);
    expect(partDayEventsLayout[1].collisions).toBe(undefined);
  });

  it("should handle an empty event list", () => {
    const events: CalendarEvent[] = [];

    const layouts = generateEventLayouts({
      startCalendarDate: "2023-10-10",
      endCalendarDate: "2023-10-10",
      events,
      timezone: "UTC",
      userCalendarId: "primary-calendar",
    });

    const dayLayout = layouts["2023-10-10"];
    // Depending on implementation, if no events exist, the day entry might be missing.
    if (!dayLayout) {
      expect(Object.keys(layouts).length).toBe(0);
      return;
    }
    expect(dayLayout.allDayEventsLayout.length).toBe(0);
    expect(dayLayout.partDayEventsLayout.length).toBe(0);
  });

  it("should handle a single event", () => {
    const events: CalendarEvent[] = [
      {
        id: "1",
        calendarId: "primary-calendar",
        title: "Event 1",
        start: "2023-10-10T08:00:00Z",
        end: "2023-10-10T09:00:00Z",
      },
    ];

    const layouts = generateEventLayouts({
      startCalendarDate: "2023-10-10",
      endCalendarDate: "2023-10-10",
      events,
      timezone: "UTC",
      userCalendarId: "primary-calendar",
    });

    const dayLayout = layouts["2023-10-10"];
    expect(dayLayout.partDayEventsLayout.length).toBe(1);
    expect(dayLayout.partDayEventsLayout[0].collisions).toBe(undefined);
  });

  it("should handle events spanning midnight", () => {
    const events: CalendarEvent[] = [
      {
        id: "1",
        calendarId: "primary-calendar",
        title: "Event 1",
        start: "2023-10-10T05:00:00Z",
        end: "2023-10-11T05:00:00Z",
      },
      {
        id: "2",
        calendarId: "primary-calendar",
        title: "Event 2",
        start: "2023-10-11T05:00:00Z",
        end: "2023-10-11T09:00:00Z",
      },
    ];

    const layouts = generateEventLayouts({
      startCalendarDate: "2023-10-10",
      endCalendarDate: "2023-10-11",
      events,
      timezone: "UTC",
      userCalendarId: "primary-calendar",
    });

    const layoutDay1 = layouts["2023-10-10"];
    const layoutDay2 = layouts["2023-10-11"];

    // Day 2 should see both events overlapping from 00:00–01:00
    expect(layoutDay2?.allDayEventsLayout.length).toBe(1);
    expect(layoutDay2?.partDayEventsLayout.length).toBe(1);

    const evt1 = layoutDay1.allDayEventsLayout[0];
    const evt2 = layoutDay2.allDayEventsLayout[0];

    expect(evt1.wrapEnd).toBeTruthy();
    expect(evt2.wrapEnd).toBeFalsy();
  });

  it("should handle events in different time zones", () => {
    const events: CalendarEvent[] = [
      {
        id: "1",
        calendarId: "primary-calendar",
        title: "Event 1",
        start: "2023-10-10T08:00:00+00:00",
        end: "2023-10-10T09:00:00+00:00",
      },
      {
        id: "2",
        calendarId: "secondary-calendar",
        title: "Event 2",
        start: "2023-10-10T08:00:00-04:00",
        end: "2023-10-10T09:00:00-04:00",
      },
    ];

    const layouts = generateEventLayouts({
      startCalendarDate: "2023-10-10",
      endCalendarDate: "2023-10-10",
      events,
      timezone: "UTC",
      userCalendarId: "primary-calendar",
    });

    const dayLayout = layouts["2023-10-10"];
    expect(dayLayout).toBeDefined();

    const { partDayEventsLayout } = dayLayout;
    expect(partDayEventsLayout.length).toBe(2);

    // These events do not overlap in UTC after conversion, so expect collisions.total = 1 for each.
    expect(partDayEventsLayout[0].collisions).toBe(undefined);
    expect(partDayEventsLayout[1].collisions).toBe(undefined);
  });

  it("should prioritize primary calendar events in collision sorting", () => {
    // Here we mix a primary calendar event with one from a non-primary calendar.
    const events: CalendarEvent[] = [
      {
        id: "1",
        calendarId: "primary-calendar",
        title: "Primary Event",
        start: "2023-10-10T08:00:00Z",
        end: "2023-10-10T09:00:00Z",
      },
      {
        id: "2",
        calendarId: "secondary-calendar",
        title: "Secondary Event",
        start: "2023-10-10T08:15:00Z",
        end: "2023-10-10T09:15:00Z",
      },
    ];

    const layouts = generateEventLayouts({
      startCalendarDate: "2023-10-10",
      endCalendarDate: "2023-10-10",
      events,
      timezone: "UTC",
      userCalendarId: "primary-calendar",
    });

    const dayLayout = layouts["2023-10-10"];
    expect(dayLayout).toBeDefined();
    const { partDayEventsLayout } = dayLayout;
    expect(partDayEventsLayout.length).toBe(2);

    // Expect both events to have collision data with total = 2.
    const primaryEvent = partDayEventsLayout.find((e) => e.event.id === "1")!;
    const secondaryEvent = partDayEventsLayout.find((e) => e.event.id === "2")!;
    expect(primaryEvent.collisions?.total).toBe(2);
    expect(secondaryEvent.collisions?.total).toBe(2);
    // The primary event (from "primary-calendar") should be ordered before the secondary event.
    expect(primaryEvent.collisions?.order).toBeLessThan(
      secondaryEvent.collisions?.order || 0
    );
  });
});
