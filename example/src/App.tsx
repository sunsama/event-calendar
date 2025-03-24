import EventCalendar, {
  type CalendarEvent,
  EditStatus,
  type EventCalendarMethods,
  EventExtend,
  type OnCreateEventProps,
  type OnEventEditParams,
} from "@sunsama/event-calendar";
import { StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import moment from "moment-timezone";
import Animated, {
  DerivedValue,
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Toast from "react-native-toast-message";
import {
  DEFAULT_MAX_ALL_DAY_EVENTS,
  DEFAULT_MAX_ZOOM,
  DEFAULT_MIN_ZOOM,
  DEFAULT_MINUTE_HEIGHT,
  DEFAULT_TIME_FORMAT,
  DEFAULT_TIMEZONE,
} from "src/utils/globals";
import { debounce } from "lodash";

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
    start: "2023-10-10T14:30:00Z",
    end: "2023-10-10T14:35:00Z",
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

const timeFormat = DEFAULT_TIME_FORMAT;

const RenderEvent = ({
  event,
  height,
  extend,
  updatedTimes,
}: {
  // The raw CalendarEvent
  event: ExtendedCalendarEvent;
  // If this event has started in the past, extends into the future, both or none
  extend: EventExtend;
  // The height of the event, if there is no height, this is an all-day event
  height?: SharedValue<number>;
  // The updated start and end times, if the event is being edited, only for timed events
  // DerivedValues are read-only values that are updated when the dependencies change
  // Now these values are the minutes from the start of the day on the day of the event,
  // e.g. 5:00 PM is 1020 minutes from the start of the day. You can convert this to a date
  // using `moment.tz(event.start, "UTC").startOf("day").add(freshMinutes, "minutes")`
  // This is done out of pure ~laziness~ optimisation to avoid having to convert the minutes to a
  // date every time the time changes.
  updatedTimes?: {
    updatedStart: DerivedValue<number>;
    updatedEnd: DerivedValue<number>;
  };
}) => {
  const [start, setStart] = useState(
    moment.tz(event.start, "UTC").format(timeFormat)
  );
  const [end, setEnd] = useState(
    moment.tz(event.end, "UTC").format(timeFormat)
  );

  useEffect(() => {
    if (updatedTimes) {
      // Don't override the start and end times if they are being edited
      return;
    }

    setStart(moment.tz(event.start, "UTC").format(timeFormat));
    setEnd(moment.tz(event.end, "UTC").format(timeFormat));
  }, [event.start, event.end, updatedTimes]);

  const setFormattedStart = useCallback(
    (freshStart: number) => {
      setStart(
        moment
          .tz(event.start, "UTC")
          .startOf("day")
          .add(freshStart, "minutes")
          .format(timeFormat)
      );
    },
    [event.start]
  );

  const setFormattedEnd = useCallback(
    (freshEnd: number) => {
      setEnd(
        moment
          .tz(event.start, "UTC")
          .startOf("day")
          .add(freshEnd, "minutes")
          .format(timeFormat)
      );
    },
    [event.start]
  );

  useAnimatedReaction(
    () => updatedTimes?.updatedStart.value,
    (newStart) => {
      if (updatedTimes) {
        runOnJS(setFormattedStart)(newStart || 0);
      }
    },
    [updatedTimes]
  );

  useAnimatedReaction(
    () => updatedTimes?.updatedEnd.value,
    (newEnd) => {
      if (updatedTimes) {
        runOnJS(setFormattedEnd)(newEnd || 0);
      }
    },
    [updatedTimes]
  );

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
            {start} - {end}
          </Text>
        ) : null}
      </Animated.View>
    </View>
  );
};

const ExtraTimedComponents = ({
  zoomLevel,
}: {
  zoomLevel: SharedValue<number>;
}) => {
  const styleViewEnd = useAnimatedStyle(() => {
    return {
      position: "absolute",
      paddingRight: 10,
      left: 0,
      right: 0,
      height: 10000,
      backgroundColor: "rgba(255,0,0,0.08)",
      zIndex: 2,
      pointerEvents: "none",
      borderColor: "purple",
      borderTopWidth: 2,
      transform: [{ translateY: 1020 * zoomLevel.value }],
      alignItems: "flex-end",
    };
  }, [zoomLevel]);

  const styleViewStart = useAnimatedStyle(() => {
    return {
      position: "absolute",
      paddingRight: 10,
      right: 0,
      left: 0,
      top: 0,
      height: 420 * zoomLevel.value,
      backgroundColor: "rgba(72,255,0,0.08)",
      zIndex: 2,
      pointerEvents: "none",
      borderColor: "green",
      borderBottomWidth: 2,
      alignItems: "flex-end",
      justifyContent: "flex-end",
    };
  }, [zoomLevel]);

  return (
    <>
      <Animated.View style={styleViewStart}>
        <Text style={styles.extraText}>start of work day</Text>
      </Animated.View>
      <Animated.View style={styleViewEnd}>
        <Text style={styles.extraText}>end of work day</Text>
      </Animated.View>
    </>
  );
};

const extraTimedComponents = (zoomLevel: SharedValue<number>) => (
  <ExtraTimedComponents zoomLevel={zoomLevel} />
);

const m = moment();

const formatTime = (hour: number, minute: number) => {
  const start = m.hour(hour).minute(minute);
  const end = start.clone().add(1, "hour");

  return `${start.format(timeFormat)} - ${end.format(timeFormat)}`;
};

type ExtendedCalendarEvent = CalendarEvent & {
  bla: boolean;
};

export default function App() {
  const refEventCalendar = useRef<EventCalendarMethods>(null);

  const [sanitizedEvents, setSanitizedEvents] =
    useState<ExtendedCalendarEvent[]>(events);

  const onEventEdit = useCallback(
    ({
      event,
      updatedTimes,
      status,
    }: OnEventEditParams<ExtendedCalendarEvent>) => {
      console.info("onEventEdit", event, updatedTimes, status);

      switch (status) {
        case EditStatus.Finish:
          if (updatedTimes) {
            setSanitizedEvents((currentEvents) =>
              currentEvents.map((currentEvent) =>
                currentEvent.id === event.id
                  ? {
                      ...currentEvent,
                      start: updatedTimes?.updatedStart,
                      end: updatedTimes?.updatedEnd,
                    }
                  : currentEvent
              )
            );
          }
          break;
      }
    },
    []
  );

  useEffect(() => {
    // Scroll to the current minutes
    const scrollDate = moment.tz(DEFAULT_TIMEZONE);

    // setTimeout is needed to make sure the ref is set
    setTimeout(() => {
      refEventCalendar.current?.scrollToTime(
        scrollDate.minutes() + scrollDate.hours() * 60
      );
    }, 0);

    // Uncomment this to see how you can programmatically start and end edit mode
    // setTimeout(() => {
    //   refEventCalendar.current?.scrollToTime(12 * 60);
    //   refEventCalendar.current?.startEditMode("10");
    // }, 5000);
    //
    // setTimeout(() => {
    //   refEventCalendar.current?.endEditMode();
    // }, 10000);
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.container}>
        <StatusBar style="auto" />
        <SafeAreaView style={styles.container}>
          <View style={styles.main}>
            <EventCalendar
              // Events to display on the calendar
              events={sanitizedEvents}
              // The current date of the calendar
              dayDate={date}
              // Triggered when a new event is created
              onCreateEvent={(params: OnCreateEventProps) => {
                console.log("onCreateEvent", params);
              }}
              // Triggered when pressed on an event
              onPressEvent={(event: ExtendedCalendarEvent) => {
                console.log("onPressEvent", event);
              }}
              // The user's primary calendar, this is used in sorting the calendar events making the primary calendar
              // always show up at the beginning of the stack if reasonably possible
              userCalendarId="primary-calendar"
              // How the time should be formatted
              timeFormat={timeFormat}
              // Shows a line on the calendar indicating the current time
              showTimeIndicator
              // Can the user create new events
              canCreateEvents
              // Can the user this SPECIFIC event (in combination with canEditEvents).
              // Can either be a function or a boolean in general to allow/block all event editing.
              // The library will NOT let the user know if it is editable or not, that's up to you.
              // - By default, all events are editable.
              // - Currently all day events are not editable.
              canEditEvent={(event: { calendarId: string }) => {
                const allowed = event.calendarId !== "tertiary-calendar";

                if (!allowed) {
                  Toast.show({
                    type: "error",
                    autoHide: true,
                    position: "top",
                    text1: "You cannot edit this event.",
                  });
                }

                return allowed;
              }}
              // When editing this is shown in the edited event to indicate the user can change the height of the event
              // You can either give nothing, a top and bottom component or just a top or bottom component. Whatever you
              // supply will be shown in the event when editing. If not supplied the user cannot use that part of the event
              // to change the height.
              renderDragBars={{
                top: (_event: ExtendedCalendarEvent) => (
                  <View style={styles.dragBarTop} />
                ),
                bottom: (_event: ExtendedCalendarEvent) => (
                  <View style={styles.dragBarBottom} />
                ),
              }}
              // If you want the calendar to start in edit mode for a specific event, you can use this
              // initialEventEdit="17"
              // If you want to access the EventCalendarMethods, you can use this ref
              ref={refEventCalendar}
              // Render the main event component, timed and all day events
              renderEvent={(
                event: ExtendedCalendarEvent,
                extend: EventExtend,
                height?: SharedValue<number>,
                updatedTimes?: {
                  updatedStart: DerivedValue<number>;
                  updatedEnd: DerivedValue<number>;
                }
              ) => (
                <RenderEvent
                  event={event}
                  height={height}
                  extend={extend}
                  updatedTimes={updatedTimes}
                />
              )}
              // This callback is triggered when an event is edited, at the start and when the user is done editing
              onEventEdit={onEventEdit}
              // The theme of the calendar, overrides the default theme
              theme={undefined}
              // The initial zoom level of the calendar, you can use this to restore the zoom level of the calendar
              initialZoomLevel={DEFAULT_MINUTE_HEIGHT}
              // The default zoom level of the calendar, this is the zoom level the calendar will start at and can restore at
              // This is different from the initial zoom level, as the initial zoom level is the zoom level you can save and restore
              // to the default zoom level is the zoom level the calendar starts at. This affects the height of the all-day events.
              defaultZoomLevel={DEFAULT_MINUTE_HEIGHT}
              // The minimum zoom level of the calendar
              minZoomLevel={DEFAULT_MIN_ZOOM}
              // The maximum zoom level of the calendar
              maxZoomLevel={DEFAULT_MAX_ZOOM}
              // Maximum number of all day events to display before showing a "show more" button
              maxAllDayEvents={DEFAULT_MAX_ALL_DAY_EVENTS}
              // The timezone of the calendar
              timezone={DEFAULT_TIMEZONE}
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
              // When editing an event or creating a new one this is making sure that it isn't granular per minute
              fiveMinuteInterval
              // Determines if the library should optimistically update the local state when editing has finished
              // Defaults to true
              updateLocalStateAfterEdit
              // Extra components to render in the timed section of the calendar
              extraTimedComponents={extraTimedComponents}
              // Called when the zoom value changes
              onZoomChange={(newZoom: number) => {
                console.info("onZoomChange", newZoom);
              }}
              onScroll={debounce(
                (y: number) => {
                  console.info("onScroll", y);
                },
                1000,
                { trailing: true }
              )}
            />
          </View>
          <Toast />
        </SafeAreaView>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    marginTop: 8,
  },
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
  dragBarTop: {
    margin: 2,
    height: 10,
    backgroundColor: "red",
    opacity: 0.3,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  dragBarBottom: {
    margin: 2,
    height: 10,
    backgroundColor: "blue",
    opacity: 0.3,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  extraText: {
    fontSize: 10,
    color: "gray",
  },
});
