import { Moment } from "moment-timezone";
import { TextStyle, ViewStyle } from "react-native";
import { DerivedValue, SharedValue } from "react-native-reanimated";
import { ReactNode } from "react";

export type CalendarEvent = {
  id: string;
  calendarId: string;
  title: string;
  start: string;
  end: string;
  isAllDay?: boolean;
};

export type AllDayEventLayoutType = {
  event: CalendarEvent;
  rowIndex?: number;
  visibleWidthDays?: number;
  extend: EventExtend;
  isPrimaryRendered?: boolean;
};

export type PartDayEventLayoutType = {
  event: CalendarEvent;
  collisions?: {
    total: number;
    order: number;
  };
  position: EventPosition;
};

export interface CollisionObject {
  event: CalendarEvent;
  collisions?: { total: number; order: number };
}

export type EventPosition = {
  top: number;
  height: number;
  width: string;
  marginLeft: string;
};

export type FullCalendarEventLayout = {
  allDayEventsLayout: AllDayEventLayoutType[];
  partDayEventsLayout: PartDayEventLayoutType[];
};

export type ThemeStyle = {
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
  // New event inner container, if you don't want to use the `renderNewEventContainer` prop
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

export type OnCreateEventProps = {
  hour?: number;
  minute?: number;
  isAllDay?: boolean;
};

export type onCreateEvent = (arg: OnCreateEventProps) => void;

export type Config = {
  timezone: string;
  timeFormat: string;
  dayDate: Moment;
  theme?: ThemeStyle;
  zoomLevel: SharedValue<number>;
  layout: FullCalendarEventLayout;
  createY: SharedValue<number>;
  maximumHour: SharedValue<number>;
  onCreateEvent?: onCreateEvent;
  initialZoomLevel: number;
  renderEvent: (
    event: CalendarEvent,
    extended: EventExtend,
    eventHeight?: SharedValue<number>,
    updatedTimes?: {
      updatedStart: DerivedValue<number>;
      updatedEnd: DerivedValue<number>;
    }
  ) => ReactNode;
  onEventEdit?: (params: {
    event: CalendarEvent;
    status: EditStatus;
    updatedTimes?: {
      updatedStart: string;
      updatedEnd: string;
    };
  }) => void;
  onPressEvent?: (event: CalendarEvent) => void;
  showTimeIndicator?: boolean;
  maxAllDayEvents: number;
  canCreateEvents: boolean;
  canEditEvent: boolean | ((event: CalendarEvent) => boolean);
  renderNewEventContainer?: (hour: number, minute: number) => ReactNode;
  fiveMinuteInterval?: boolean;
  renderDragBars?: { top?: () => ReactNode; bottom?: () => ReactNode };
  updateLocalStateAfterEdit: boolean;
  extraTimedComponents?: (zoomLevel: SharedValue<number>) => ReactNode;
  onZoomChange?: (zoomLevel: number) => void;
};

export type PrefabHour = {
  increment: number;
  hourFormatted: string;
  hourMoment: Moment;
};

export type CalendarViewIntervalType =
  | "month"
  | "workweek"
  | "3day"
  | "1day"
  | "week";

/**
 * Tells us if an event extends into the next day, the previous day, or both.
 * Used for all day events.
 */
export enum EventExtend {
  // Keep None as value 0
  None,
  Past,
  Future,
  Both,
}

export enum EditStatus {
  Start,
  Finish,
}
