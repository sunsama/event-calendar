import EventCalender from "@sunsama/event-calendar";
import { StyleSheet, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import moment from "moment-timezone";
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

const events: CalendarEvent[] = [
  {
    id: "1",
    title: "Event 1",
    start: "2023-10-10T08:00:00Z",
    end: "2023-10-10T09:00:00Z",
    isAllDay: false,
    calendarId: "primary-calendar",
  },
  {
    id: "2",
    title: "Event 2",
    start: "2023-10-10T08:30:00Z",
    end: "2023-10-10T09:30:00Z",
    isAllDay: false,
    calendarId: "secondary-calendar",
  },
  {
    id: "3",
    title: "Event 3",
    start: "2023-10-10T08:10:00Z",
    end: "2023-10-10T10:00:00Z",
    isAllDay: false,
    calendarId: "tertiary-calendar",
  },
  {
    id: "4",
    title: "Event 4",
    start: "2023-10-10T09:30:00Z",
    end: "2023-10-10T10:30:00Z",
    isAllDay: false,
    calendarId: "secondary-calendar",
  },
  {
    id: "5",
    title: "Event 5",
    start: "2023-10-10T10:00:00Z",
    end: "2023-10-10T11:00:00Z",
    isAllDay: false,
    calendarId: "primary-calendar",
  },
  {
    id: "6",
    title: "Event 6",
    start: "2023-10-10T10:30:00Z",
    end: "2023-10-10T11:30:00Z",
    isAllDay: false,
    calendarId: "secondary-calendar",
  },
  {
    id: "7",
    title: "Event 7",
    start: "2023-10-10T11:00:00Z",
    end: "2023-10-10T12:00:00Z",
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
    start: "2023-10-10T14:00:00Z",
    end: "2023-10-10T15:00:00Z",
    isAllDay: false,
    calendarId: "primary-calendar",
  },
  {
    id: "14",
    title: "Event 14",
    start: "2023-10-10T14:30:00Z",
    end: "2023-10-10T15:30:00Z",
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
    start: "2023-10-10T16:30:00Z",
    end: "2023-10-10T17:30:00Z",
    isAllDay: false,
    calendarId: "secondary-calendar",
  },
  {
    id: "19",
    title: "Event 19",
    start: "2023-10-10T17:00:00Z",
    end: "2023-10-10T17:10:00Z",
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

const timeFormat = "hh:mm";
// const timeFormat = "h a";

const RenderEvent = ({
  event,
  height,
}: {
  event: CalendarEvent;
  height: SharedValue<number>;
}) => {
  const start = moment(event.start);
  const end = moment(event.end);

  const styleRowOrColumn = useAnimatedStyle(() => {
    if (height.value < 45) {
      return {
        flexDirection: "row",
        alignItems: "center",
        padding: 1,
      };
    }

    return { flexDirection: "column", alignItems: "flex-start", padding: 5 };
  }, [height]);

  return (
    <Animated.View
      style={[
        styles.eventContainer,
        styleRowOrColumn,
        {
          backgroundColor: eventColor(event.calendarId),
        },
      ]}
    >
      <Text style={styles.eventTextTitle}>{event.title}</Text>
      <Text style={styles.eventTextTime}>
        {start.format(timeFormat)} - {end.format(timeFormat)}
      </Text>
    </Animated.View>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.container}>
        <StatusBar style="auto" />
        <SafeAreaView style={styles.container}>
          <EventCalender
            events={events}
            dayDate={date}
            onCreateEvent={(params: any) => {
              console.log("Create event", params);
            }}
            onPressEvent={(event: any) => {
              console.log("Press event", event);
            }}
            userCalendarId="primary-calendar"
            startDayOfWeekOffset={0}
            timeFormat={timeFormat}
            renderEvent={(event: any, height: SharedValue<number>) => (
              <RenderEvent event={event} height={height} />
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
    margin: 2,
    flex: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "white",
    overflow: "hidden",
  },
  eventTextTitle: {
    marginRight: 5,
  },
  eventTextTime: {
    fontSize: 11,
  },
});
