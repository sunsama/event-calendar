import _partition from "lodash/partition";
import _reduce from "lodash/reduce";
import _sortBy from "lodash/sortBy";
import _reverse from "lodash/reverse";
import moment, { Moment } from "moment-timezone";
import { CalendarLayout } from "src/utils/calendar-layout";
import {
  computeCalendarDateRange,
  dateRangeIntersect,
  getDuration,
  getDurationInDays,
  isAllDayOrSpansMidnight,
  startOfUserWeek,
} from "src/utils/date-utils";
import computePositioning from "src/utils/compute-positioning";
import {
  AllDayEventLayoutType,
  CalendarEvent,
  CalendarViewIntervalType,
  CollisionObject,
  EventExtend,
  FullCalendarEventLayout,
  PartDayEventLayoutType,
} from "src/types";

interface GenerateEventLayouts {
  events: CalendarEvent[];
  userCalendarId: string;
  timezone: string;
  startCalendarDate: string;
  endCalendarDate: string;
  startDayOfWeekOffset?: number;
  calendarViewInterval?: CalendarViewIntervalType;
}

export const generateEventLayouts = ({
  events,
  startCalendarDate,
  endCalendarDate,
  userCalendarId,
  calendarViewInterval = "1day",
  startDayOfWeekOffset = 0,
  timezone,
}: GenerateEventLayouts) => {
  // Calculate spacial layout for CalendarViewDay events
  // in month view, midnight-spanning part-day events are rendered as all-day multi-day
  const [allDayEvents, partDayEvents] = _partition([...events], (event) =>
    isAllDayOrSpansMidnight(event, timezone)
  );

  // lowest priority sort by ID for consistent ordering of otherwise equal events
  let allDayEventsSorted = _sortBy(allDayEvents, (event) => event.id);

  // secondary sort by length descending
  allDayEventsSorted = _sortBy(allDayEventsSorted, (event) =>
    getDurationInDays(event, timezone)
  );
  allDayEventsSorted = _reverse(allDayEventsSorted);

  // primary sort by start ascending
  allDayEventsSorted = _sortBy(allDayEventsSorted, (event) =>
    new Date(event.start).valueOf()
  );

  // lowest priority sort by ID for consistent ordering of otherwise equal events
  let partDayEventsSorted = _sortBy(partDayEvents, (event) => event.id);

  partDayEventsSorted = _sortBy(partDayEventsSorted, (event) =>
    getDuration(event)
  ); // secondary sort by duration ascending
  partDayEventsSorted = _sortBy(partDayEventsSorted, (event) =>
    new Date(event.start).valueOf()
  ); // primary sort by start ascending
  const calendarViewDayEvents = [
    ...allDayEventsSorted,
    ...(calendarViewInterval === "month" ? partDayEventsSorted : []),
  ];

  const visibleDayCount = moment
    .tz(endCalendarDate, timezone)
    .diff(moment.tz(startCalendarDate, timezone), "days");
  const visibleDays: string[] = [];
  for (let dayCount = 0; dayCount <= visibleDayCount; dayCount++) {
    visibleDays.push(
      moment
        .tz(startCalendarDate, timezone)
        .add(dayCount, "day")
        .format("YYYY-MM-DD")
    );
  }

  const calendarViewDateRanges = visibleDays.map((visibleDay) => {
    return computeCalendarDateRange(
      visibleDay,
      timezone,
      calendarViewInterval,
      startDayOfWeekOffset
    );
  });

  const result: {
    [day: string]: FullCalendarEventLayout;
  } = {};

  calendarViewDateRanges.forEach((date) => {
    const calendarLayoutOptions = {
      visibleX: date.dayIndexes,
      enableWeekBreaks: calendarViewInterval === "month",
      startOfWeekXOffset: moment
        .tz(date.basisDate, timezone)
        .diff(
          startOfUserWeek(startDayOfWeekOffset, date.basisDate!, timezone),
          "days"
        ),
    };
    const calendarViewDayLayout = _reduce(
      calendarViewDayEvents,
      (calendarLayout, event) => {
        const eventStartIndex = moment
          .tz(event.start, timezone)
          .startOf("day")
          .diff(moment.tz(date.basisDate, timezone), "days");
        const eventDurationDays = getDurationInDays(event, timezone);

        calendarLayout.findFitAndInsert(
          eventStartIndex,
          eventDurationDays,
          event
        );
        return calendarLayout;
      },
      new CalendarLayout(calendarLayoutOptions)
    );
    const calendarViewDayRowHeight = calendarViewDayLayout.height();

    // set the calendar layout for each day
    const calendarDates = date.calendarDates || [];

    calendarDates.forEach((calendarDate) => {
      const currentDayDate = moment.tz(calendarDate, timezone).startOf("day");
      const startDate = currentDayDate.toDate();
      const endDate = moment.tz(startDate, timezone).endOf("day").toDate();
      const showHours = !["month"].includes(calendarViewInterval);
      const dayId = calendarDate;
      const allDayEventsLayout: AllDayEventLayoutType[] = [];
      let partDayEventsLayout: PartDayEventLayoutType[] = [];

      const x = moment(startDate).diff(
        moment.tz(date.basisDate, timezone),
        "days"
      );
      for (let y = 0; y < calendarViewDayRowHeight; ++y) {
        const {
          event,
          visibleWidthDays,
          extend = EventExtend.None,
          isPrimaryRendered,
        } = calendarViewDayLayout.getViewAt(x, y);
        if (event) {
          allDayEventsLayout.push({
            event,
            rowIndex: y,
            // @ts-ignore we know visibleWidthDays will be set for all day events if an event is returned
            visibleWidthDays,
            extend,
            isPrimaryRendered,
          });
        }
      }

      // Handle part day events according to view type
      if (showHours) {
        // Bucket, partition, sort, and handle collisions
        partDayEventsLayout = partDayEventsLayout.concat(
          handleCollisions(
            events.filter(
              (event) =>
                !isAllDayOrSpansMidnight(event, timezone) &&
                dateRangeIntersect(
                  {
                    startDate: new Date(event.start),
                    endDate: new Date(event.end),
                  },
                  { startDate, endDate }
                )
            ),
            userCalendarId,
            currentDayDate,
            timezone
          )
        );
      }

      result[dayId] = {
        allDayEventsLayout,
        partDayEventsLayout,
      };
    });
  });

  return result;
};

const combineEventPosition = (
  dayDate: Moment,
  timezone: string,
  collisionObject: CollisionObject
): PartDayEventLayoutType => {
  const position = computePositioning({
    timezone,
    collisionObject: collisionObject,
    startOfDayMoment: dayDate,
  });

  return {
    ...collisionObject,
    position,
  };
};

const handleCollisions = (
  allEvents: CalendarEvent[],
  userCalendarId: string,
  dayDate: Moment,
  timezone: string
): PartDayEventLayoutType[] => {
  let stackableEvents = _sortBy(allEvents, (event) => event.id);
  stackableEvents = _sortBy(stackableEvents, (event) => {
    // current user's primary calendar should always be leftmost option
    return event.calendarId && !event.calendarId.includes(userCalendarId);
  });
  stackableEvents = _sortBy(stackableEvents, (event) =>
    new Date(event.start).valueOf()
  );
  // calculate overlap stack properties
  const stackedEvtsByPos: Record<string, PartDayEventLayoutType[]> = {};
  let curStack: (CollisionObject | null)[] = [];

  for (const evt of stackableEvents) {
    // already sorted by startDate
    for (let idx = 0; idx < curStack.length; idx++) {
      const stackEvt = curStack[idx];

      if (stackEvt) {
        const stackEvtEnd = new Date(stackEvt.event.end).valueOf();
        const stackEvtStart = new Date(stackEvt.event.start).valueOf();
        const eventStart = new Date(evt.start).valueOf();

        // events shorter than 15 minutes behave as if they had 15 minute duration.
        // matches behavior in calendar view, where the shortest 'height' an event is given matches the height of a 15 minute event.
        const duration = (stackEvtEnd - stackEvtStart) / (1000 * 60);
        const endDate =
          duration < 15 ? stackEvtStart + 15 * 60 * 1000 : stackEvtEnd;

        if (endDate <= eventStart) {
          // null out this event's position in stack
          curStack[idx] = null;

          if (curStack.length > 1) {
            stackEvt.collisions = { total: curStack.length, order: idx };
          }

          stackedEvtsByPos[idx]
            ? stackedEvtsByPos[idx].push(
                combineEventPosition(dayDate, timezone, stackEvt)
              )
            : (stackedEvtsByPos[idx] = [
                combineEventPosition(dayDate, timezone, stackEvt),
              ]);

          if (!curStack.some((el) => el)) {
            curStack = [];
          }
        }
      }
    }

    // plop evt into first null placeholder we find, or just push if we don't have any.
    const spliceIdx = curStack.findIndex((stackEvt) => !stackEvt);
    spliceIdx > -1
      ? curStack.splice(spliceIdx, 1, { event: evt })
      : curStack.splice(curStack.length, 0, { event: evt });
  }

  // clean up stack if we've exhausted allEvents and it's unpopped.
  for (let idx = 0; idx < curStack.length; idx++) {
    const stackEvt = curStack[idx];

    if (stackEvt) {
      if (curStack.length > 1) {
        stackEvt.collisions = { total: curStack.length, order: idx };
      }

      stackedEvtsByPos[idx]
        ? stackedEvtsByPos[idx].push(
            combineEventPosition(dayDate, timezone, stackEvt)
          )
        : (stackedEvtsByPos[idx] = [
            combineEventPosition(dayDate, timezone, stackEvt),
          ]);
    }
  }

  // always draw position 0 stack elements first.
  let stackedEvents: PartDayEventLayoutType[] = [];

  Object.keys(stackedEvtsByPos).forEach(
    (pos) => (stackedEvents = stackedEvents.concat(stackedEvtsByPos[pos]))
  );

  return [...stackedEvents];
};

export default generateEventLayouts;
