import { StyleSheet, View } from "react-native";
import AllDayEvents from "./components/all-day-events";
import { ScrollView } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";
import ZoomProvider from "./components/zoom-provider";
import TimedEvents from "./components/timed-events";
import {
  ConfigProvider,
  DEFAULT_MAX_ALL_DAY_EVENTS,
  DEFAULT_MAX_ZOOM,
  DEFAULT_MIN_ZOOM,
  DEFAULT_MINUTE_HEIGHT,
  DEFAULT_TIME_FORMAT,
  DEFAULT_TIMEZONE,
} from "./utils/globals";
import moment, { type Moment } from "moment-timezone";
import React, {
  forwardRef,
  type Ref,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { GestureRef } from "react-native-gesture-handler/lib/typescript/handlers/gestures/gesture";
import { IsEditingProvider } from "./hooks/use-is-editing";
import { EventsProvider, useEvents } from "./hooks/use-events";
import type { CalendarEvent, Config, onCreateEvent, ThemeStyle } from "./types";
import {
  LayoutChangeEvent,
  NativeSyntheticEvent,
} from "react-native/Libraries/Types/CoreEventTypes";
import type { NativeScrollEvent } from "react-native/Libraries/Components/ScrollView/ScrollView";

export * from "./types";

type EventCalenderProps<T extends CalendarEvent> = {
  onScroll?: (minutes: number) => void;
  canCreateEvents?: boolean;
  canEditEvent?: Config<T>["canEditEvent"];
  dayDate: string;
  events: T[];
  fiveMinuteInterval?: boolean;
  initialZoomLevel?: number;
  defaultZoomLevel?: number;
  maxZoomLevel?: number;
  minZoomLevel?: number;
  maxAllDayEvents?: number;
  onCreateEvent?: onCreateEvent;
  onEventEdit?: Config<T>["onEventEdit"];
  onPressEvent?: Config<T>["onPressEvent"];
  renderDragBars?: Config<T>["renderDragBars"];
  renderEvent: Config<T>["renderEvent"];
  renderNewEventContainer?: Config<T>["renderNewEventContainer"];
  showTimeIndicator?: boolean;
  theme?: ThemeStyle;
  timeFormat?: string;
  timezone?: string;
  updateLocalStateAfterEdit?: boolean;
  userCalendarId?: string;
  extraTimedComponents?: Config<T>["extraTimedComponents"];
  onZoomChange?: Config<T>["onZoomChange"];
};

type EventCalenderContentProps<T extends CalendarEvent> = {
  onScroll?: (minutes: number) => void;
  canCreateEvents: boolean;
  canEditEvent: Config<T>["canEditEvent"];
  startCalendarDate: Moment;
  fiveMinuteInterval?: boolean;
  initialZoomLevel?: number;
  defaultZoomLevel: number;
  maxZoomLevel: number;
  minZoomLevel: number;
  maxAllDayEvents: number;
  onCreateEvent?: onCreateEvent;
  onEventEdit?: Config<T>["onEventEdit"];
  onPressEvent?: Config<T>["onPressEvent"];
  renderDragBars?: Config<T>["renderDragBars"];
  renderEvent: Config<T>["renderEvent"];
  renderNewEventContainer?: Config<T>["renderNewEventContainer"];
  showTimeIndicator?: boolean;
  theme?: ThemeStyle;
  timeFormat: string;
  timezone: string;
  updateLocalStateAfterEdit: boolean;
  extraTimedComponents?: Config<T>["extraTimedComponents"];
  onZoomChange?: Config<T>["onZoomChange"];
};

export type EventCalendarMethods = {
  scrollToTime: (minutes: number, animated?: boolean, offset?: number) => void;
};

function EventCalendarContentInner<T extends CalendarEvent>(
  {
    canCreateEvents,
    canEditEvent,
    fiveMinuteInterval,
    initialZoomLevel,
    defaultZoomLevel,
    minZoomLevel,
    maxZoomLevel,
    maxAllDayEvents,
    onCreateEvent,
    onEventEdit,
    onPressEvent,
    renderDragBars,
    renderEvent,
    renderNewEventContainer,
    showTimeIndicator,
    theme,
    timeFormat,
    timezone,
    updateLocalStateAfterEdit,
    extraTimedComponents,
    onZoomChange,
    startCalendarDate,
    onScroll,
  }: EventCalenderContentProps<T>,
  refMethods: Ref<EventCalendarMethods>
) {
  const zoomLevel = useSharedValue(initialZoomLevel || defaultZoomLevel);
  const createY = useSharedValue(-1);
  const maximumHour = useSharedValue(0);

  const refNewEvent = useRef<GestureRef>(null);
  const refScrollView = useRef<ScrollView>(null);
  const refScrollViewHeight = useRef<number>(0);

  const onLayoutScrollView = useCallback((event: LayoutChangeEvent) => {
    refScrollViewHeight.current = event.nativeEvent.layout.height;
  }, []);

  useImperativeHandle(
    refMethods,
    () => ({
      scrollToTime: (time: number, animated = true, offset = 2.5) => {
        refScrollView.current?.scrollTo({
          y: time * zoomLevel.value - refScrollViewHeight.current / offset,
          animated,
        });
      },
    }),
    [zoomLevel]
  );

  const onScrollFeedback = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      onScroll && onScroll(event.nativeEvent.contentOffset.y / zoomLevel.value);
    },
    [zoomLevel, onScroll]
  );

  const { eventsLayout } = useEvents();

  return (
    <View style={[styles.container, theme?.container]}>
      <ConfigProvider.Provider
        value={{
          dayDate: startCalendarDate,
          timeFormat,
          layout: eventsLayout,
          zoomLevel,
          initialZoomLevel: initialZoomLevel || defaultZoomLevel,
          defaultZoomLevel,
          maxZoomLevel,
          minZoomLevel,
          createY,
          onCreateEvent,
          timezone,
          renderEvent,
          onPressEvent,
          showTimeIndicator,
          maxAllDayEvents,
          canCreateEvents,
          renderNewEventContainer,
          fiveMinuteInterval,
          canEditEvent,
          onEventEdit,
          renderDragBars,
          maximumHour,
          extraTimedComponents,
          onZoomChange,
          updateLocalStateAfterEdit,
          theme,
        }}
      >
        <AllDayEvents />
        <ScrollView
          onLayout={onLayoutScrollView}
          bounces={false}
          keyboardShouldPersistTaps="always"
          style={[styles.scrollView, theme?.scrollView]}
          ref={refScrollView}
          onScroll={onScrollFeedback}
        >
          <IsEditingProvider>
            <ZoomProvider ref={refNewEvent}>
              <View style={[styles.borderContainer, theme?.borderContainer]} />
              <TimedEvents refNewEvent={refNewEvent} />
            </ZoomProvider>
          </IsEditingProvider>
        </ScrollView>
      </ConfigProvider.Provider>
    </View>
  );
}

const EventCalendarContent = forwardRef(EventCalendarContentInner) as <
  T extends CalendarEvent,
>(
  props: EventCalenderContentProps<T> & { ref?: Ref<EventCalendarMethods> }
) => ReturnType<typeof EventCalendarContentInner>;

function EventCalendarInner<T extends CalendarEvent>(
  {
    timeFormat = DEFAULT_TIME_FORMAT,
    dayDate,
    events,
    defaultZoomLevel = DEFAULT_MINUTE_HEIGHT,
    timezone = DEFAULT_TIMEZONE,
    userCalendarId = "",
    maxAllDayEvents = DEFAULT_MAX_ALL_DAY_EVENTS,
    minZoomLevel = DEFAULT_MIN_ZOOM,
    maxZoomLevel = DEFAULT_MAX_ZOOM,
    updateLocalStateAfterEdit = true,
    canCreateEvents = true,
    canEditEvent = true,
    ...props
  }: EventCalenderProps<T>,
  ref: Ref<EventCalendarMethods>
) {
  const startCalendarDate = useMemo(
    () => moment.tz(dayDate, timezone).startOf("day"),
    [dayDate, timezone]
  );

  return (
    <EventsProvider
      initialProps={{
        startCalendarDate: startCalendarDate.format("YYYY-MM-DD"),
        calendarViewInterval: "1day",
        endCalendarDate: startCalendarDate.format("YYYY-MM-DD"),
        userCalendarId,
        timezone,
        startDayOfWeekOffset: 0,
        events,
      }}
      updateLocalStateAfterEdit={!!updateLocalStateAfterEdit}
    >
      <EventCalendarContent
        ref={ref}
        {...props}
        timeFormat={timeFormat}
        defaultZoomLevel={defaultZoomLevel}
        timezone={timezone}
        maxAllDayEvents={maxAllDayEvents}
        updateLocalStateAfterEdit={updateLocalStateAfterEdit}
        startCalendarDate={startCalendarDate}
        canCreateEvents={canCreateEvents}
        canEditEvent={canEditEvent}
        maxZoomLevel={maxZoomLevel}
        minZoomLevel={minZoomLevel}
      />
    </EventsProvider>
  );
}

const EventCalendar = forwardRef(EventCalendarInner) as <
  T extends CalendarEvent,
>(
  props: EventCalenderProps<T> & { ref?: Ref<EventCalendarMethods> }
) => ReturnType<typeof EventCalendarInner>;

export default EventCalendar;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#F0F0F0",
    overflow: "hidden",
  },
  scrollView: {
    paddingTop: 8,
    backgroundColor: "white",
    flex: 1,
  },
  borderContainer: {
    position: "absolute",
    height: "200%",
    left: 50,
    top: -18,
    width: 5,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderColor: "black",
  },
});
