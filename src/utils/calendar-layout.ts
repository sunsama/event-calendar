import { max } from "lodash";
import { EventExtend } from "src/enums";

export class CalendarLayout {
  // visibleX is an array of numbers representing the x indexes currently 'in view'
  // enableWeekBreaks is a bool indicating if events are split at week boundary (monthview)
  // startOfWeekXOffset is the offset to the start of the week from index 0
  array2d: any[];
  visibleX: Set<number>;
  enableWeekBreaks: boolean;
  startOfWeekXOffset: number;

  constructor({
    visibleX,
    enableWeekBreaks,
    startOfWeekXOffset,
  }: {
    visibleX: number[];
    enableWeekBreaks: boolean;
    startOfWeekXOffset: number;
  }) {
    this.array2d = [];
    this.visibleX = new Set(visibleX);
    this.enableWeekBreaks = enableWeekBreaks;
    this.startOfWeekXOffset = startOfWeekXOffset;
  }

  getAt(x: number, y: number) {
    return this.array2d[x] && this.array2d[x][y];
  }

  setAt(x: number, y: number, value: { value: any; meta: { x: any } }) {
    let column = this.array2d[x];
    if (!column) {
      column = [];
      this.array2d[x] = column;
    }
    column[y] = value;
  }
  // assign value to the line of cells from (x, y) to (x + w, y)
  setRange(x: number, y: number, duration: number, value: any) {
    for (let increment = 0; increment < duration; ++increment) {
      this.setAt(x + increment, y, { value, meta: { x } });
    }
  }
  // does the event starting time at x with duration w fit at position y?
  fit(x: number, y: number, duration: number) {
    for (let increment = 0; increment < duration; ++increment) {
      if (this.getAt(x + increment, y)) {
        return false;
      }
    }
    return true;
  }
  // find the row where the event starting at time x with duration w fits
  findFit(x: number, duration: number) {
    let rowIndex = 0;
    while (!this.fit(x, rowIndex, duration)) {
      ++rowIndex;
    }
    return rowIndex;
  }
  // inserts an event record into the matrix
  findFitAndInsert(
    eventStartIndex: number,
    eventDurationDays: number,
    event: any
  ) {
    const rowIndex = this.findFit(eventStartIndex, eventDurationDays);
    this.setRange(eventStartIndex, rowIndex, eventDurationDays, event);
  }
  // find the height of the 2d array
  height() {
    return this.array2d.length > 0
      ? max(this.array2d.map((col) => (col && col.length) || 0))
      : 0;
  }
  // get the event and associated view data for the given cell
  getViewAt(x: number, y: number) {
    const record = this.getAt(x, y);
    if (!record) {
      return {};
    }
    const {
      value: event,
      meta: { x: rootX },
    } = record;
    const previousRecord = this.visibleX.has(x - 1)
      ? this.getAt(x - 1, y)
      : null;
    if (event) {
      const isPrimaryRendered =
        x === rootX ||
        !previousRecord ||
        previousRecord.value !== event ||
        (this.enableWeekBreaks &&
          Math.floor((x + this.startOfWeekXOffset) / 7) !==
            Math.floor((x + this.startOfWeekXOffset - 1) / 7));
      // count the contiguous visible days for this event
      let visibleWidthDays = 1;
      while (
        this.visibleX.has(x + visibleWidthDays) &&
        (!this.enableWeekBreaks ||
          Math.floor((x + this.startOfWeekXOffset + visibleWidthDays) / 7) ===
            Math.floor(
              (x + this.startOfWeekXOffset + visibleWidthDays - 1) / 7
            )) &&
        this.getAt(x + visibleWidthDays, y) &&
        this.getAt(x + visibleWidthDays, y).value === event
      ) {
        visibleWidthDays++;
      }

      const wrapStart = x !== rootX;
      const wrapEnd =
        this.getAt(x + visibleWidthDays, y) &&
        this.getAt(x + visibleWidthDays, y).value === event;

      let extend = EventExtend.None;

      if (wrapStart && wrapEnd) {
        extend = EventExtend.Both;
      } else if (wrapStart) {
        extend = EventExtend.Past;
      } else if (wrapEnd) {
        extend = EventExtend.Future;
      }

      return {
        event,
        visibleWidthDays,
        isPrimaryRendered,
        extend,
      };
    }

    return {};
  }
}
