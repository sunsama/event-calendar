import { StyleSheet, View } from "react-native";
import AllDayEvents from "src/components/all-day-events";
import { ScrollView } from "react-native-gesture-handler";
import { refScrollView } from "src/utils/references";
import { useSharedValue } from "react-native-reanimated";
import ZoomProvider from "src/components/zoom-provider";
import TimedEvents from "src/components/timed-events";
import useEventsLayout, { UpdateEvent } from "src/hooks/use-events-layout";
import { ConfigProvider, DEFAULT_MINUTE_HEIGHT } from "src/utils/globals";
import moment from "moment-timezone";
import { useMemo } from "react";

type EventCalenderProps = {
  events: CalendarEvent[];
  timeFormat?: string;
  dayDate: string;
  theme?: ThemeStyle;
  initialZoomLevel?: number;
  onCreateEvent?: onCreateEvent;
  timezone?: string;
  renderEvent: Config["renderEvent"];
  onPressEvent?: Config["onPressEvent"];
  userCalendarId: string;
  startDayOfWeekOffset: number;
  showTimeIndicator?: boolean;
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
  userCalendarId,
  startDayOfWeekOffset,
  showTimeIndicator,
}: EventCalenderProps) => {
  const startCalendarDate = useMemo(
    () => moment.tz(dayDate, timezone).startOf("day"),
    [dayDate, timezone]
  );

  const memoizedProps = useMemo<UpdateEvent>(
    () => ({
      startCalendarDate: startCalendarDate.format("YYYY-MM-DD"),
      calendarViewInterval: "1day",
      endCalendarDate: startCalendarDate.format("YYYY-MM-DD"),
      userCalendarId,
      timezone,
      startDayOfWeekOffset,
      events,
    }),
    [startCalendarDate, userCalendarId, timezone, startDayOfWeekOffset, events]
  );

  const layout = useEventsLayout(memoizedProps);

  const zoomLevel = useSharedValue(initialZoomLevel);
  const createY = useSharedValue(-1);

  return (
    <View style={[styles.container, theme?.container]}>
      <ConfigProvider.Provider
        value={{
          dayDate: startCalendarDate,
          timeFormat,
          layout,
          zoomLevel,
          createY,
          onCreateEvent,
          timezone,
          renderEvent,
          onPressEvent,
          showTimeIndicator,
        }}
      >
        <AllDayEvents />
        <ScrollView
          ref={refScrollView}
          bounces={false}
          keyboardShouldPersistTaps="always"
          style={[styles.scrollView, theme?.scrollView]}
        >
          <ZoomProvider>
            <TimedEvents />
          </ZoomProvider>
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
  },
  scrollView: {
    paddingTop: 8,
    backgroundColor: "white",
    flex: 1,
  },
});

export default EventCalendar;
