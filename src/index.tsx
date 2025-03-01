import { StyleSheet, View } from "react-native";
import AllDayEvents from "src/components/all-day-events";
import { ScrollView } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";
import ZoomProvider from "src/components/zoom-provider";
import TimedEvents from "src/components/timed-events";
import useEventsLayout, { UpdateEvent } from "src/hooks/use-events-layout";
import { ConfigProvider, DEFAULT_MINUTE_HEIGHT } from "src/utils/globals";
import moment from "moment-timezone";
import { useMemo, useRef } from "react";
import { GestureRef } from "react-native-gesture-handler/lib/typescript/handlers/gestures/gesture";
import { IsEditingProvider } from "src/hooks/use-is-editing";
import useClonedEvents from "src/hooks/use-cloned-events";
import type {
  CalendarEvent,
  Config,
  onCreateEvent,
  ThemeStyle,
} from "src/types";

type EventCalenderProps = {
  canCreateEvents?: boolean;
  canEditEvent?: Config["canEditEvent"];
  dayDate: string;
  events: CalendarEvent[];
  fiveMinuteInterval?: boolean;
  initialZoomLevel?: number;
  maxAllDayEvents?: number;
  onCreateEvent?: onCreateEvent;
  onEventEdit?: Config["onEventEdit"];
  onPressEvent?: Config["onPressEvent"];
  renderDragBars?: Config["renderDragBars"];
  renderEvent: Config["renderEvent"];
  renderNewEventContainer?: Config["renderNewEventContainer"];
  showTimeIndicator?: boolean;
  theme?: ThemeStyle;
  timeFormat?: string;
  timezone?: string;
  updateLocalStateAfterEdit?: boolean;
  userCalendarId?: string;
  extraTimedComponents?: Config["extraTimedComponents"];
  onZoomChange?: Config["onZoomChange"];
};

const EventCalendar = ({
  events,
  timeFormat = "HH:mm",
  dayDate,
  theme,
  initialZoomLevel = DEFAULT_MINUTE_HEIGHT,
  onCreateEvent,
  timezone = "UTC",
  renderEvent,
  onPressEvent,
  userCalendarId = "",
  showTimeIndicator,
  maxAllDayEvents = 2,
  canCreateEvents = true,
  renderNewEventContainer,
  fiveMinuteInterval,
  canEditEvent = true,
  onEventEdit,
  renderDragBars,
  updateLocalStateAfterEdit = true,
  extraTimedComponents,
  onZoomChange,
}: EventCalenderProps) => {
  const startCalendarDate = useMemo(
    () => moment.tz(dayDate, timezone).startOf("day"),
    [dayDate, timezone]
  );

  const clonedEvents = useClonedEvents(events, updateLocalStateAfterEdit);

  const memoizedProps = useMemo<UpdateEvent>(
    () => ({
      startCalendarDate: startCalendarDate.format("YYYY-MM-DD"),
      calendarViewInterval: "1day",
      endCalendarDate: startCalendarDate.format("YYYY-MM-DD"),
      userCalendarId,
      timezone,
      startDayOfWeekOffset: 0,
      events: clonedEvents,
    }),
    [startCalendarDate, userCalendarId, timezone, clonedEvents]
  );

  const layout = useEventsLayout(memoizedProps);
  const zoomLevel = useSharedValue(initialZoomLevel);
  const createY = useSharedValue(-1);
  const maximumHour = useSharedValue(0);

  const refNewEvent = useRef<GestureRef>(null);

  return (
    <View style={[styles.container, theme?.container]}>
      <ConfigProvider.Provider
        value={{
          dayDate: startCalendarDate,
          timeFormat,
          layout,
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
          updateLocalStateAfterEdit,
          extraTimedComponents,
          onZoomChange,
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
