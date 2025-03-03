import { StyleSheet, View } from "react-native";
import AllDayEvents from "./components/all-day-events";
import { ScrollView } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";
import ZoomProvider from "./components/zoom-provider";
import TimedEvents from "./components/timed-events";
import { ConfigProvider, DEFAULT_MINUTE_HEIGHT } from "./utils/globals";
import moment, { type Moment } from "moment-timezone";
import { useMemo, useRef } from "react";
import { GestureRef } from "react-native-gesture-handler/lib/typescript/handlers/gestures/gesture";
import { IsEditingProvider } from "./hooks/use-is-editing";
import { EventsProvider, useEvents } from "./hooks/use-events";
import type { CalendarEvent, Config, onCreateEvent, ThemeStyle } from "./types";

export * from "./types";

type EventCalenderProps<T extends CalendarEvent> = {
  canCreateEvents?: boolean;
  canEditEvent?: Config<T>["canEditEvent"];
  dayDate: string;
  events: T[];
  fiveMinuteInterval?: boolean;
  initialZoomLevel?: number;
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
  canCreateEvents: boolean;
  canEditEvent: Config<T>["canEditEvent"];
  startCalendarDate: Moment;
  fiveMinuteInterval?: boolean;
  initialZoomLevel: number;
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
const EventCalendarContent = <T extends CalendarEvent>({
  canCreateEvents,
  canEditEvent,
  fiveMinuteInterval,
  initialZoomLevel,
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
}: EventCalenderContentProps<T>) => {
  const zoomLevel = useSharedValue(initialZoomLevel);
  const createY = useSharedValue(-1);
  const maximumHour = useSharedValue(0);

  const refNewEvent = useRef<GestureRef>(null);

  const { eventsLayout } = useEvents();

  return (
    <View style={[styles.container, theme?.container]}>
      <ConfigProvider.Provider
        value={{
          dayDate: startCalendarDate,
          timeFormat,
          layout: eventsLayout,
          zoomLevel,
          createY,
          initialZoomLevel,
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
          bounces={false}
          keyboardShouldPersistTaps="always"
          style={[styles.scrollView, theme?.scrollView]}
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
};

/**
 * Wraps `EventCalendarContent` inside `ClonedEventsProvider` to manage cloned events independently.
 */
const EventCalendar = <T extends CalendarEvent>({
  timeFormat = "HH:mm",
  dayDate,
  events,
  initialZoomLevel = DEFAULT_MINUTE_HEIGHT,
  timezone = "UTC",
  userCalendarId = "",
  maxAllDayEvents = 2,
  updateLocalStateAfterEdit = true,
  canCreateEvents = true,
  canEditEvent = true,
  ...props
}: EventCalenderProps<T>) => {
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
        {...props}
        timeFormat={timeFormat}
        initialZoomLevel={initialZoomLevel}
        timezone={timezone}
        maxAllDayEvents={maxAllDayEvents}
        updateLocalStateAfterEdit={updateLocalStateAfterEdit}
        startCalendarDate={startCalendarDate}
        canCreateEvents={canCreateEvents}
        canEditEvent={canEditEvent}
      />
    </EventsProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 8,
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

export default EventCalendar;
