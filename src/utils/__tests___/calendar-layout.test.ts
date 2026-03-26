import { CalendarLayout } from "../calendar-layout";
import { EventExtend } from "../../types";

const defaultOptions = {
  visibleX: [0],
  enableWeekBreaks: false,
  startOfWeekXOffset: 0,
};

describe("CalendarLayout", () => {
  describe("constructor", () => {
    it("should initialize with empty array2d", () => {
      const layout = new CalendarLayout(defaultOptions);
      expect(layout.array2d).toEqual([]);
    });

    it("should store visibleX as a Set", () => {
      const layout = new CalendarLayout({
        ...defaultOptions,
        visibleX: [0, 1, 2],
      });
      expect(layout.visibleX).toBeInstanceOf(Set);
      expect(layout.visibleX.has(0)).toBe(true);
      expect(layout.visibleX.has(1)).toBe(true);
      expect(layout.visibleX.has(2)).toBe(true);
      expect(layout.visibleX.has(3)).toBe(false);
    });
  });

  describe("getAt / setAt", () => {
    it("should return undefined for empty positions", () => {
      const layout = new CalendarLayout(defaultOptions);
      expect(layout.getAt(0, 0)).toBeUndefined();
      expect(layout.getAt(5, 5)).toBeUndefined();
    });

    it("should store and retrieve values", () => {
      const layout = new CalendarLayout(defaultOptions);
      const value = { value: "event-a", meta: { x: 0 } };
      layout.setAt(0, 0, value);
      expect(layout.getAt(0, 0)).toBe(value);
    });

    it("should handle setting at non-zero positions", () => {
      const layout = new CalendarLayout(defaultOptions);
      const value = { value: "event-a", meta: { x: 3 } };
      layout.setAt(3, 2, value);
      expect(layout.getAt(3, 2)).toBe(value);
      expect(layout.getAt(0, 0)).toBeUndefined();
    });
  });

  describe("setRange", () => {
    it("should fill consecutive cells with the same event", () => {
      const layout = new CalendarLayout(defaultOptions);
      layout.setRange(0, 0, 3, "event-a");

      expect(layout.getAt(0, 0).value).toBe("event-a");
      expect(layout.getAt(1, 0).value).toBe("event-a");
      expect(layout.getAt(2, 0).value).toBe("event-a");
      expect(layout.getAt(3, 0)).toBeUndefined();
    });

    it("should store the root x in meta for each cell", () => {
      const layout = new CalendarLayout(defaultOptions);
      layout.setRange(2, 0, 3, "event-a");

      // All cells should reference x=2 as the root
      expect(layout.getAt(2, 0).meta.x).toBe(2);
      expect(layout.getAt(3, 0).meta.x).toBe(2);
      expect(layout.getAt(4, 0).meta.x).toBe(2);
    });

    it("should handle duration of 1", () => {
      const layout = new CalendarLayout(defaultOptions);
      layout.setRange(0, 0, 1, "event-a");
      expect(layout.getAt(0, 0).value).toBe("event-a");
      expect(layout.getAt(1, 0)).toBeUndefined();
    });
  });

  describe("fit", () => {
    it("should return true for empty grid", () => {
      const layout = new CalendarLayout(defaultOptions);
      expect(layout.fit(0, 0, 3)).toBe(true);
    });

    it("should return false when position is occupied", () => {
      const layout = new CalendarLayout(defaultOptions);
      layout.setRange(0, 0, 3, "event-a");
      expect(layout.fit(0, 0, 1)).toBe(false);
      expect(layout.fit(1, 0, 1)).toBe(false);
      expect(layout.fit(2, 0, 1)).toBe(false);
    });

    it("should return true for a different row", () => {
      const layout = new CalendarLayout(defaultOptions);
      layout.setRange(0, 0, 3, "event-a");
      expect(layout.fit(0, 1, 3)).toBe(true);
    });

    it("should return false when partially overlapping", () => {
      const layout = new CalendarLayout(defaultOptions);
      layout.setRange(2, 0, 3, "event-a"); // occupies x=2,3,4
      // Try to fit at x=1 with duration 2 (would occupy 1,2 — overlaps at 2)
      expect(layout.fit(1, 0, 2)).toBe(false);
    });

    it("should return true when adjacent but not overlapping", () => {
      const layout = new CalendarLayout(defaultOptions);
      layout.setRange(0, 0, 2, "event-a"); // occupies x=0,1
      expect(layout.fit(2, 0, 2)).toBe(true);
    });
  });

  describe("findFit", () => {
    it("should return row 0 for empty grid", () => {
      const layout = new CalendarLayout(defaultOptions);
      expect(layout.findFit(0, 1)).toBe(0);
    });

    it("should return row 1 when row 0 is occupied", () => {
      const layout = new CalendarLayout(defaultOptions);
      layout.setRange(0, 0, 3, "event-a");
      expect(layout.findFit(0, 2)).toBe(1);
    });

    it("should return row 2 when rows 0 and 1 are occupied", () => {
      const layout = new CalendarLayout(defaultOptions);
      layout.setRange(0, 0, 3, "event-a");
      layout.setRange(0, 1, 3, "event-b");
      expect(layout.findFit(0, 2)).toBe(2);
    });

    it("should reuse row 0 when the event fits after existing event", () => {
      const layout = new CalendarLayout(defaultOptions);
      layout.setRange(0, 0, 2, "event-a"); // occupies x=0,1 at row 0
      // New event at x=2 should fit at row 0
      expect(layout.findFit(2, 1)).toBe(0);
    });
  });

  describe("findFitAndInsert", () => {
    it("should insert event in the first available row", () => {
      const layout = new CalendarLayout(defaultOptions);
      layout.findFitAndInsert(0, 3, "event-a");
      expect(layout.getAt(0, 0).value).toBe("event-a");
      expect(layout.getAt(1, 0).value).toBe("event-a");
      expect(layout.getAt(2, 0).value).toBe("event-a");
    });

    it("should stack overlapping events in different rows", () => {
      const layout = new CalendarLayout(defaultOptions);
      layout.findFitAndInsert(0, 3, "event-a"); // row 0: x=0,1,2
      layout.findFitAndInsert(1, 3, "event-b"); // overlaps at x=1,2 — row 1

      expect(layout.getAt(0, 0).value).toBe("event-a");
      expect(layout.getAt(1, 1).value).toBe("event-b");
    });

    it("should pack non-overlapping events in the same row", () => {
      const layout = new CalendarLayout(defaultOptions);
      layout.findFitAndInsert(0, 2, "event-a"); // row 0: x=0,1
      layout.findFitAndInsert(2, 2, "event-b"); // row 0: x=2,3 (no overlap)

      expect(layout.getAt(0, 0).value).toBe("event-a");
      expect(layout.getAt(2, 0).value).toBe("event-b");
    });
  });

  describe("height", () => {
    it("should return 0 for empty grid", () => {
      const layout = new CalendarLayout(defaultOptions);
      expect(layout.height()).toBe(0);
    });

    it("should return 1 for a single event", () => {
      const layout = new CalendarLayout(defaultOptions);
      layout.findFitAndInsert(0, 1, "event-a");
      expect(layout.height()).toBe(1);
    });

    it("should return the max row count across all columns", () => {
      const layout = new CalendarLayout(defaultOptions);
      layout.findFitAndInsert(0, 3, "event-a"); // row 0
      layout.findFitAndInsert(0, 3, "event-b"); // row 1
      layout.findFitAndInsert(0, 3, "event-c"); // row 2
      expect(layout.height()).toBe(3);
    });
  });

  describe("getViewAt", () => {
    it("should return empty object for empty cell", () => {
      const layout = new CalendarLayout({
        ...defaultOptions,
        visibleX: [0, 1, 2],
      });
      expect(layout.getViewAt(0, 0)).toEqual({});
    });

    it("should return event data for occupied cell", () => {
      const layout = new CalendarLayout({
        ...defaultOptions,
        visibleX: [0, 1, 2],
      });
      layout.findFitAndInsert(0, 1, "event-a");
      const view = layout.getViewAt(0, 0);
      expect(view.event).toBe("event-a");
      expect(view.visibleWidthDays).toBe(1);
    });

    it("should mark first cell as primary rendered", () => {
      const layout = new CalendarLayout({
        ...defaultOptions,
        visibleX: [0, 1, 2],
      });
      layout.findFitAndInsert(0, 3, "event-a");
      const view = layout.getViewAt(0, 0);
      expect(view.isPrimaryRendered).toBe(true);
    });

    it("should not mark continuation cells as primary rendered", () => {
      const layout = new CalendarLayout({
        ...defaultOptions,
        visibleX: [0, 1, 2],
      });
      layout.findFitAndInsert(0, 3, "event-a");
      const view = layout.getViewAt(1, 0);
      expect(view.isPrimaryRendered).toBe(false);
    });

    it("should count visible width across consecutive visible days", () => {
      const layout = new CalendarLayout({
        ...defaultOptions,
        visibleX: [0, 1, 2, 3, 4],
      });
      layout.findFitAndInsert(0, 5, "event-a");
      const view = layout.getViewAt(0, 0);
      expect(view.visibleWidthDays).toBe(5);
    });

    describe("extend flags", () => {
      it("should return EventExtend.None for single-day event", () => {
        const layout = new CalendarLayout({
          ...defaultOptions,
          visibleX: [0, 1, 2],
        });
        layout.findFitAndInsert(0, 1, "event-a");
        const view = layout.getViewAt(0, 0);
        expect(view.extend).toBe(EventExtend.None);
      });

      it("should return EventExtend.Future when event continues beyond visible range", () => {
        const layout = new CalendarLayout({
          ...defaultOptions,
          visibleX: [0], // only day 0 is visible
        });
        layout.findFitAndInsert(0, 3, "event-a"); // spans 3 days
        const view = layout.getViewAt(0, 0);
        expect(view.extend).toBe(EventExtend.Future);
      });

      it("should return EventExtend.Past when event started before visible cell", () => {
        const layout = new CalendarLayout({
          ...defaultOptions,
          visibleX: [1], // only day 1 visible
        });
        layout.findFitAndInsert(0, 3, "event-a"); // starts at day 0
        const view = layout.getViewAt(1, 0);
        // x=1, rootX=0 → wrapStart = true
        // event continues at x=2 but x=2 not visible → wrapEnd = true
        expect(view.extend).toBe(EventExtend.Both);
      });

      it("should return EventExtend.Past when event starts before and ends at visible cell", () => {
        const layout = new CalendarLayout({
          ...defaultOptions,
          visibleX: [2], // only day 2 visible
        });
        layout.findFitAndInsert(0, 3, "event-a"); // spans days 0,1,2
        const view = layout.getViewAt(2, 0);
        // x=2, rootX=0 → wrapStart = true
        // no cell at x=3 → wrapEnd = false
        expect(view.extend).toBe(EventExtend.Past);
      });
    });

    describe("week breaks", () => {
      it("should mark primary rendered at week boundary when enableWeekBreaks is true", () => {
        const layout = new CalendarLayout({
          visibleX: [0, 1, 2, 3, 4, 5, 6, 7, 8],
          enableWeekBreaks: true,
          startOfWeekXOffset: 0,
        });
        // Event spans from day 5 through day 8 (crosses week boundary at day 7)
        layout.findFitAndInsert(5, 4, "event-a");

        // Day 5 is the root — always primary rendered
        expect(layout.getViewAt(5, 0).isPrimaryRendered).toBe(true);

        // Day 7 crosses into next week — should also be primary rendered
        expect(layout.getViewAt(7, 0).isPrimaryRendered).toBe(true);
      });

      it("should limit visibleWidthDays to week boundary", () => {
        const layout = new CalendarLayout({
          visibleX: [0, 1, 2, 3, 4, 5, 6, 7, 8],
          enableWeekBreaks: true,
          startOfWeekXOffset: 0,
        });
        // Event spans from day 5 through day 8
        layout.findFitAndInsert(5, 4, "event-a");

        // At day 5, visible width should stop at the week boundary (day 7)
        const viewDay5 = layout.getViewAt(5, 0);
        expect(viewDay5.visibleWidthDays).toBe(2); // days 5, 6

        // At day 7, visible width continues in the new week
        const viewDay7 = layout.getViewAt(7, 0);
        expect(viewDay7.visibleWidthDays).toBe(2); // days 7, 8
      });
    });
  });
});
