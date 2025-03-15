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

export type AllDayEventLayoutType<T extends CalendarEvent> = {
  event: T;
  rowIndex?: number;
  visibleWidthDays?: number;
  extend: EventExtend;
  isPrimaryRendered?: boolean;
};

export type PartDayEventLayoutType<T extends CalendarEvent> = {
  event: T;
  collisions?: {
    total: number;
    order: number;
  };
  position: EventPosition;
};

export interface CollisionObject<T extends CalendarEvent> {
  event: T;
  collisions?: { total: number; order: number };
}

export type EventPosition = {
  top: number;
  height: number;
  width: string;
  marginLeft: string;
};

export type FullCalendarEventLayout<T extends CalendarEvent> = {
  allDayEventsLayout: AllDayEventLayoutType<T>[];
  partDayEventsLayout: PartDayEventLayoutType<T>[];
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
  // Dead space container, this is shown when there are too few all day events to show
  // so the user can still create an event
  allDayDeadSpace?: ViewStyle;
};

export type OnCreateEventProps = {
  hour?: number;
  minute?: number;
  isAllDay?: boolean;
};

export type onCreateEvent = (arg: OnCreateEventProps) => void;

export interface OnEventEditParams<T extends CalendarEvent> {
  event: T;
  status: EditStatus;
  updatedTimes?: {
    updatedStart: string;
    updatedEnd: string;
  };
}

export type Config<T extends CalendarEvent> = {
  timezone: string;
  timeFormat: string;
  dayDate: Moment;
  theme?: ThemeStyle;
  zoomLevel: SharedValue<number>;
  layout: FullCalendarEventLayout<T>;
  createY: SharedValue<number>;
  maximumHour: SharedValue<number>;
  onCreateEvent?: onCreateEvent;
  defaultZoomLevel: number;
  maxZoomLevel: number;
  minZoomLevel: number;
  initialZoomLevel: number;
  renderEvent: (
    event: T,
    extended: EventExtend,
    eventHeight?: SharedValue<number>,
    updatedTimes?: {
      updatedStart: DerivedValue<number>;
      updatedEnd: DerivedValue<number>;
    }
  ) => ReactNode;
  onEventEdit?: (params: OnEventEditParams<T>) => void;
  onPressEvent?: (event: T) => void;
  showTimeIndicator?: boolean;
  maxAllDayEvents: number;
  canCreateEvents: boolean;
  canEditEvent: boolean | ((event: T) => boolean);
  renderNewEventContainer?: (hour: number, minute: number) => ReactNode;
  fiveMinuteInterval?: boolean;
  renderDragBars?: {
    top?: (event: T) => ReactNode;
    bottom?: (event: T) => ReactNode;
  };
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
  Delete,
}
