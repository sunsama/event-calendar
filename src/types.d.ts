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
  extend: EventExtend;
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
  // Border container used to separate the hours and the main grid
  borderContainer?: ViewStyle;
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
  // All day main container
  allDayContainer?: ViewStyle;
  // All day event container
  allDayEventContainer?: ViewStyle;
  // Container showing when there are too many all day events to show
  allDayShowMoreContainer?: ViewStyle;
  // Text showing when there are too many all day events to show
  allDayShowMoreText?: TextStyle;
};

type onCreateEvent = (arg: {
  hour?: number;
  minute?: number;
  isAllDay?: boolean;
}) => void;

type Config = {
  timezone: string;
  timeFormat: string;
  dayDate: Moment;
  theme?: ThemeStyle;
  zoomLevel: SharedValue<number>;
  layout: FullCalendarEventLayout;
  createY: SharedValue<nummber>;
  onCreateEvent?: onCreateEvent;
  initialZoomLevel: number;
  renderEvent: (
    event: CalendarEvent,
    extended: EventExtend,
    eventHeight?: SharedValue<number>
  ) => ReactNode;
  onPressEvent?: (event: CalendarEvent) => void;
  showTimeIndicator?: boolean;
  maxAllDayEvents: number;
};

type PrefabHour = {
  increment: number;
  hourFormatted: string;
  hourMoment: Moment;
};

type CalendarViewIntervalType = "month" | "workweek" | "3day" | "1day" | "week";
