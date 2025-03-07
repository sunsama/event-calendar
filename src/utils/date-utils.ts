import moment, { type Moment } from "moment-timezone";
import { isDate, range, size } from "lodash";
import { CalendarEvent, PrefabHour } from "../types";

export const generatePrefabHours = (
  timeFormat: string = "HH:mm"
): PrefabHour[] => {
  const startOfDayMoment = moment().startOf("day");

  return [...Array(24).keys()].reduce(
    (
      accum: {
        increment: number;
        hourFormatted: string;
        hourMoment: Moment;
      }[],
      increment
    ) => {
      const hourMoment = startOfDayMoment.clone().hour(increment);

      accum.push({
        increment,
        hourFormatted: hourMoment.format(timeFormat),
        hourMoment,
      });

      return accum;
    },
    []
  );
};

// Returns a new moment instance at the start of the week in the user's
// timezone, with the user's start of week preference applied.
export const startOfUserWeek = (
  startDayOfWeekOffset: number,
  dateOrMoment: Date | Moment | string,
  timezone: string
) => {
  // If the day is Sunday, and the user's start of week preference is Sunday, return the day
  // otherwise, the start of the 'isoWeek' will be for the previous week
  if (
    startDayOfWeekOffset === 0 &&
    moment.tz(dateOrMoment, timezone).isoWeekday() === 7
  ) {
    return moment.tz(dateOrMoment, timezone).startOf("day");
  }

  return moment
    .tz(dateOrMoment, timezone)
    .startOf("isoWeek")
    .isoWeekday(startDayOfWeekOffset);
};

export const isAllDayOrSpansMidnight = <T extends CalendarEvent>(
  calendarEvent: T,
  timezone: string
) => {
  const { start, end, isAllDay } = calendarEvent;

  if (isAllDay) {
    return true;
  }

  // Does the range start/end span midnight in the given timezone?
  const startMoment = moment.tz(start, timezone);
  const endMoment = moment.tz(end, timezone);

  // Handle special case where range ends at midnight exactly, in which case spansMidnight should return false
  return !startMoment.isSame(
    endMoment.hour() === 0 ? endMoment.subtract(1, "minute") : endMoment,
    "day"
  );
};

// Returns the count of unique dates in the provided timezone
export const getDurationInDays = <T extends CalendarEvent>(
  calendarEvent: T,
  timezone: string
) => {
  // the event duration in days calculation depends on if the event is all day
  return calendarEvent.isAllDay
    ? moment
        .tz(calendarEvent.end, timezone)
        .diff(moment.tz(calendarEvent.start, timezone), "days") + 1
    : size(
        daysInRange({
          startDate: calendarEvent.start,
          endDate: calendarEvent.end,
          timezone,
        })
      );
};

// Returns an array of days (e.g. ['2022-01-02']) in a given date range.
export const daysInRange = ({
  startDate,
  endDate,
  timezone,
}: {
  startDate: Date | string;
  endDate: Date | string;
  timezone: string;
}) => {
  const countOfDaysInRange = moment
    .tz(endDate, timezone)
    .diff(moment.tz(startDate, timezone), "days");
  const startDay = moment.tz(startDate, timezone).format("YYYY-MM-DD");
  const days = [];
  // Make sure we loop at a max of 30 times here as we had events that were scheduled for all day long for
  // 1000 years in the future and this was causing the app to crash
  for (
    let countOfDaysAfterStart = 0;
    countOfDaysAfterStart <= Math.min(30, Math.abs(countOfDaysInRange));
    countOfDaysAfterStart++
  ) {
    days.push(
      moment
        .tz(startDay, timezone)
        .add(countOfDaysAfterStart, "day")
        .format("YYYY-MM-DD")
    );
  }
  return days;
};

export const getDuration = <T extends CalendarEvent>(
  calendarEvent: T,
  trueDuration?: boolean
) => {
  const minDiff =
    (new Date(calendarEvent.end).valueOf() -
      new Date(calendarEvent.start).valueOf()) /
    (1000 * 60);

  // If all-day, we want to throw in an extra 24 hours since we represent them a bit oddly.
  return calendarEvent.isAllDay && !trueDuration
    ? minDiff + 24 * 60 * 60
    : minDiff;
};

export const computeCalendarDateRange = (
  date: string | Date | Moment,
  tz: string,
  viewType: "month" | "workweek" | "3day" | "1day" | "week",
  startDayOfWeekOffset: number
) => {
  const momentDate = moment.tz(date, tz).startOf("day").toDate();

  let basis: Moment;
  let dayIndexes: number[];

  if (viewType === "month") {
    const startOfMonth = moment.tz(momentDate, tz).startOf("month");
    const numberOfDaysInViewBeforeStartOfMonth =
      startOfMonth.isoWeekday() - startDayOfWeekOffset;
    basis = startOfMonth.subtract(numberOfDaysInViewBeforeStartOfMonth, "days");
    const startOfRange = 0;
    const numberOfDaysInViewAfterEndOfMonth =
      (numberOfDaysInViewBeforeStartOfMonth +
        moment.tz(date, tz).daysInMonth()) %
      7
        ? 7 -
          ((numberOfDaysInViewBeforeStartOfMonth +
            moment.tz(date, tz).daysInMonth()) %
            7)
        : 0;
    const endOfRange =
      numberOfDaysInViewBeforeStartOfMonth +
      moment.tz(date, tz).daysInMonth() +
      numberOfDaysInViewAfterEndOfMonth;
    dayIndexes = range(startOfRange, endOfRange);
  } else if (viewType === "workweek") {
    basis = startOfUserWeek(startDayOfWeekOffset, momentDate, tz);
    dayIndexes = range(0, 7).filter(
      (dayIndex) =>
        [0, 6].indexOf(basis.clone().add(dayIndex, "day").day()) === -1
    );
  } else if (viewType === "3day") {
    // On PYD, we need to see more than just today, as potentially we'll see yesterday and tomorrow
    basis = moment.tz(momentDate, tz);
    dayIndexes = [0, 1, 2];
  } else if (viewType === "1day") {
    basis = moment.tz(momentDate, tz);
    dayIndexes = [0];
  } else {
    basis = startOfUserWeek(startDayOfWeekOffset, momentDate, tz);
    dayIndexes = range(0, 7);
  }

  const days = dayIndexes.map((dayIndex) =>
    moment.tz(basis, tz).add(dayIndex, "day").toDate()
  );
  const calendarDates = dayIndexes.map((dayIndex) =>
    moment.tz(basis, tz).add(dayIndex, "day").format("YYYY-MM-DD")
  );

  return {
    basisDate: moment(basis, tz).toDate(),
    dayIndexes,
    days,
    startDate: days[0],
    endDate: moment
      .tz(days[days.length - 1], tz)
      .add(1, "day")
      .toDate(),
    calendarDates,
    startCalendarDate: calendarDates[0],
    endCalendarDate: calendarDates[calendarDates.length - 1],
  };
};

// tests if the date ranges intersect
export const dateRangeIntersect = (
  { startDate: start0, endDate: end0 }: { startDate: Date; endDate: Date },
  { startDate: start1, endDate: end1 }: { startDate: Date; endDate: Date }
) => {
  if (!isDate(start0) || !isDate(end0) || !isDate(start1) || !isDate(end1)) {
    throw `invalid parameter ${start0} ${end0}; must pass dates`;
  }

  const s0 = start0.getTime();
  const e0 = end0.getTime();
  const s1 = start1.getTime();
  const e1 = end1.getTime();

  if (s0 > e0 || s1 > e1) {
    return false;
  }

  return isBetween(s0, s1, e1) || isBetween(s1, s0, e0);
};

const isBetween = (
  value: number,
  startInclusive: number,
  endExclusive: number
) => value >= startInclusive && value < endExclusive;
