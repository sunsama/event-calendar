import EventCalendar from "@sunsama/event-calendar";
import { StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import moment from "moment-timezone";
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { EventExtend } from "src/enums";
import { useMemo } from "react";

const events: any[] = [
  {
    id: "1",
    title: "Event 1",
    start: "2023-10-10T05:00:00Z",
    end: "2023-10-10T06:00:00Z",
    isAllDay: false,
    calendarId: "primary-calendar",
  },
  {
    id: "2",
    title: "Event 2",
    start: "2023-10-10T05:30:00Z",
    end: "2023-10-10T06:30:00Z",
    isAllDay: false,
    calendarId: "secondary-calendar",
  },
  {
    id: "3",
    title: "Event 3",
    start: "2023-10-10T05:10:00Z",
    end: "2023-10-10T07:00:00Z",
    isAllDay: false,
    calendarId: "tertiary-calendar",
  },
  {
    id: "4",
    title: "Event 4",
    start: "2023-10-10T05:40:00Z",
    end: "2023-10-10T07:30:00Z",
    isAllDay: false,
    calendarId: "secondary-calendar",
  },
  {
    id: "5",
    title: "Event 5",
    start: "2023-10-10T08:00:00Z",
    end: "2023-10-10T09:00:00Z",
    isAllDay: false,
    calendarId: "primary-calendar",
  },
  {
    id: "6",
    title: "Event 6",
    start: "2023-10-10T08:30:00Z",
    end: "2023-10-10T09:30:00Z",
    isAllDay: false,
    calendarId: "secondary-calendar",
  },
  {
    id: "7",
    title: "Event 7",
    start: "2023-10-10T08:10:00Z",
    end: "2023-10-10T10:00:00Z",
    isAllDay: false,
    calendarId: "primary-calendar",
  },
  {
    id: "8",
    title: "Event 8",
    start: "2023-10-10T11:30:00Z",
    end: "2023-10-10T12:30:00Z",
    isAllDay: false,
    calendarId: "secondary-calendar",
  },
  {
    id: "9",
    title: "Event 9",
    start: "2023-10-10T12:00:00Z",
    end: "2023-10-10T13:00:00Z",
    isAllDay: false,
    calendarId: "primary-calendar",
  },
  {
    id: "10",
    title: "Event 10",
    start: "2023-10-10T12:30:00Z",
    end: "2023-10-10T13:30:00Z",
    isAllDay: false,
    calendarId: "secondary-calendar",
  },
  {
    id: "11",
    title: "Event 11",
    start: "2023-10-10T13:00:00Z",
    end: "2023-10-10T14:00:00Z",
    isAllDay: false,
    calendarId: "primary-calendar",
  },
  {
    id: "12",
    title: "Event 12",
    start: "2023-10-10T13:30:00Z",
    end: "2023-10-10T14:30:00Z",
    isAllDay: false,
    calendarId: "secondary-calendar",
  },
  {
    id: "13",
    title: "Event 13",
    start: "2023-10-10T02:00:00Z",
    end: "2023-10-10T03:00:00Z",
    isAllDay: false,
    calendarId: "primary-calendar",
  },
  {
    id: "14",
    title: "Event 14",
    start: "2023-10-10T02:30:00Z",
    end: "2023-10-10T04:30:00Z",
    isAllDay: false,
    calendarId: "secondary-calendar",
  },
  {
    id: "15",
    title: "Event 15",
    start: "2023-10-10T15:00:00Z",
    end: "2023-10-10T16:00:00Z",
    isAllDay: false,
    calendarId: "primary-calendar",
  },
  {
    id: "16",
    title: "Event 16",
    start: "2023-10-10T15:30:00Z",
    end: "2023-10-10T16:30:00Z",
    isAllDay: false,
    calendarId: "secondary-calendar",
  },
  {
    id: "17",
    title: "Event 17",
    start: "2023-10-10T16:00:00Z",
    end: "2023-10-10T17:00:00Z",
    isAllDay: false,
    calendarId: "primary-calendar",
  },
  {
    id: "18",
    title: "Event 18",
    start: "2023-10-10T17:30:00Z",
    end: "2023-10-10T18:00:00Z",
    isAllDay: false,
    calendarId: "secondary-calendar",
  },
  {
    id: "19",
    title: "Event 19",
    start: "2023-10-10T17:30:00Z",
    end: "2023-10-10T18:00:00Z",
    isAllDay: false,
    calendarId: "primary-calendar",
  },
  {
    id: "20",
    title: "Event 20",
    start: "2023-10-10T18:30:00Z",
    end: "2023-10-10T19:45:00Z",
    isAllDay: false,
    calendarId: "tertiary-calendar",
  },
  {
    id: "21",
    title: "All Day Event 1",
    start: "2023-10-10T00:00:00Z",
    end: "2023-10-10T23:59:59Z",
    isAllDay: true,
    calendarId: "primary-calendar",
  },
  {
    id: "22",
    title: "All Day Event 2",
    start: "2023-10-09T00:00:00Z",
    end: "2023-10-10T23:59:59Z",
    isAllDay: true,
    calendarId: "secondary-calendar",
  },
  {
    id: "23",
    title: "All Day Event 3",
    start: "2023-10-10T00:00:00Z",
    end: "2023-10-11T23:59:59Z",
    isAllDay: true,
    calendarId: "secondary-calendar",
  },
  {
    id: "24",
    title: "All Day Event 4",
    start: "2023-10-09T00:00:00Z",
    end: "2023-10-11T23:59:59Z",
    isAllDay: true,
    calendarId: "secondary-calendar",
  },
  {
    id: "25",
    title: "All Day Event 5",
    start: "2023-10-10T00:00:00Z",
    end: "2023-10-10T23:59:59Z",
    isAllDay: true,
    calendarId: "secondary-calendar",
  },
  {
    id: "26",
    title: "All Day Event 6",
    start: "2023-10-10T00:00:00Z",
    end: "2023-10-10T23:59:59Z",
    isAllDay: true,
    calendarId: "secondary-calendar",
  },
  {
    id: "27",
    title: "All Day Event 7",
    start: "2023-10-10T00:00:00Z",
    end: "2023-10-10T23:59:59Z",
    isAllDay: true,
    calendarId: "secondary-calendar",
  },
];

const date = "2023-10-10T15:00:00.000Z";

const eventColor = (calendarId: string) => {
  switch (calendarId) {
    case "primary-calendar":
      return "lightblue";
    case "secondary-calendar":
      return "lightgreen";
    case "tertiary-calendar":
      return "lightcoral";
  }
};

const timeFormat = "HH:mm";
// const timeFormat = "h a";

const RenderEvent = ({
  event,
  height,
  extend,
}: {
  event: any;
  extend: EventExtend;
  height?: SharedValue<number>;
}) => {
  const start = moment.tz(event.start, "UTC");
  const end = moment.tz(event.end, "UTC");

  const extendText = useMemo(() => {
    switch (extend) {
      case EventExtend.Past:
        return " (past)";
      case EventExtend.Future:
        return " (future)";
      case EventExtend.Both:
        return " (both)";
      default:
        return "";
    }
  }, [extend]);

  const styleRowOrColumn = useAnimatedStyle(() => {
    // When there is NO height, this means it is an all-day event, of if there is a height, but it is less than 45,
    // it is a short event, and we want to display it in a row.
    if (!height || height.value < 45) {
      return {
        flexDirection: "row",
        alignItems: "center",
        padding: 1,
      };
    }

    return { flexDirection: "column", alignItems: "flex-start", padding: 5 };
  }, [height]);

  return (
    <View style={styles.eventContainer}>
      <Animated.View
        style={[
          styles.eventInnerContainer,
          styleRowOrColumn,
          {
            backgroundColor: eventColor(event.calendarId),
          },
        ]}
      >
        <Text style={styles.eventTextTitle}>
          {event.title} {extendText}
        </Text>
        {height ? (
          <Text style={styles.eventTextTime}>
            {start.format(timeFormat)} - {end.format(timeFormat)}
          </Text>
        ) : null}
      </Animated.View>
    </View>
  );
};

const m = moment();

const formatTime = (hour: number, minute: number) => {
  const start = m.hour(hour).minute(minute);
  const end = start.clone().add(1, "hour");

  return `${start.format(timeFormat)} - ${end.format(timeFormat)}`;
};

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.container}>
        <StatusBar style="auto" />
        <SafeAreaView style={styles.container}>
          <EventCalendar
            // Events to display on the calendar
            events={events}
            // The current date of the calendar
            dayDate={date}
            // Triggered when a new event is created
            onCreateEvent={(params: any) => {
              console.log("Create event", params);
            }}
            // Triggered when pressed on an event
            onPressEvent={(event: any) => {
              console.log("Press event", event);
            }}
            // The user's primary calendar, this is used in sorting the calendar events making the primary calendar
            // always show up at the beginning of the stack if reasonably possible
            userCalendarId="primary-calendar"
            // Day of the week the user begins their week
            startDayOfWeekOffset={0}
            // How the time should be formatted
            timeFormat={timeFormat}
            showTimeIndicator
            // Can the user create new events
            canCreateEvents
            // Render the main event component, timed and all day events
            renderEvent={(
              event: any,
              extend: EventExtend,
              height?: SharedValue<number>
            ) => <RenderEvent event={event} height={height} extend={extend} />}
            // The theme of the calendar, overrides the default theme
            theme={undefined}
            // The initial zoom level of the calendar, you can use this to save the zoom level and restore it
            initialZoomLevel={undefined}
            // Maximum number of all day events to display before showing a "show more" button
            maxAllDayEvents={3}
            // The timezone of the calendar
            timezone="UTC"
            // Renders the new event container, this is the component that shows up when the user is creating a new event
            // The time is already formatted in the timeFormat given
            renderNewEventContainer={(hour: number, minute: number) => (
              <View style={styles.eventContainer}>
                <View style={styles.newEventContainer}>
                  <Text style={styles.eventTextTitle}>New event</Text>
                  <Text style={styles.eventTextTime}>
                    {formatTime(hour, minute)}
                  </Text>
                </View>
              </View>
            )}
          />
        </SafeAreaView>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
  },
  eventContainer: {
    backgroundColor: "white",
    borderRadius: 4,
    overflow: "hidden",
    flex: 1,
  },
  eventInnerContainer: {
    margin: 2,
    borderRadius: 4,
    flex: 1,
  },
  eventTextTitle: {
    marginRight: 5,
  },
  eventTextTime: {
    fontSize: 11,
  },
  newEventContainer: {
    margin: 2,
    borderRadius: 4,
    padding: 5,
    flex: 1,
    backgroundColor: eventColor("primary-calendar"),
  },
});
