type CalendarEvent = {
  id: string;
  calendarId: string;
  title: string;
  start: string;
  end: string;
  isAllDay?: boolean;
};

type AllDayEventLayoutType = {
  event: CalendarEvent;
  rowIndex?: number;
  visibleWidthDays?: number;
  wrapStart?: boolean;
  wrapEnd?: boolean;
  isPrimaryRendered?: boolean;
};

type PartDayEventLayoutType = {
  event: CalendarEvent;
  collisions?: {
    total: number;
    order: number;
  };
};

type FullCalendarEventLayout = {
  allDayEventsLayout: AllDayEventLayoutType[];
  partDayEventsLayout: PartDayEventLayoutType[];
};

type ThemeStyle = {
  // Main container style
  container?: ViewStyle;
  // Vertical scroll view
  scrollView?: ViewStyle;
  // Timed events main container
  timedEventsContainer?: ViewStyle;
  // Background hours container
  backgroundHoursContainer?: ViewStyle;
  // Background hours inner container
  backgroundHoursInnerContainer?: ViewStyle;
  // Background hours text
  backgroundHoursText?: TextStyle;
  // Background hours layout container
  backgroundHoursLayoutContainer?: ViewStyle;
  // New event container styling
  newEventContainer?: ViewStyle;
  // Event container title
  eventTitle?: TextStyle;
  // Event container subtitle
  eventSubtitle?: TextStyle;
  // Event container main container
  eventContainer?: ViewStyle;
  // Style the time indicator
  timeIndicator?: ViewStyle;
};

type onCreateEvent = (arg: {
  hour?: number;
  minute?: number;
  isAllDay?: boolean;
}) => void;

/**
 * Tells us if an event extends into the next day or the previous day.
 * Used mainly for all day events.
 */
enum EventExtend {
  Yesterday,
  Tomorrow,
  None,
}

type Config = {
  timezone: string;
  timeFormat: string;
  dayDate: Moment;
  theme?: ThemeStyle;
  zoomLevel: SharedValue<number>;
  layout: FullCalendarEventLayout;
  createY: SharedValue<nummber>;
  onCreateEvent?: onCreateEvent;
  primaryCalendarId?: string;
  renderEvent: (
    event: CalendarEvent,
    eventHeight: SharedValue<number>,
    extended: EventExtend
  ) => ReactNode;
  onPressEvent?: (event: CalendarEvent) => void;
  showTimeIndicator?: boolean;
};

type PrefabHour = {
  increment: number;
  hourFormatted: string;
  hourMoment: Moment;
};

type CalendarViewIntervalType = "month" | "workweek" | "3day" | "1day" | "week";
