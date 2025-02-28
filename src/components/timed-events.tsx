import { StyleSheet, View } from "react-native";
import { RefObject, useContext, useMemo } from "react";
import { ConfigProvider, TOP_MARGIN_PIXEL_OFFSET } from "src/utils/globals";
import BackgroundHoursLayout from "src/components/background-hours-layout";
import { generatePrefabHours } from "src/utils/date-utils";
import BackgroundHoursContent from "src/components/background-hours-content";
import TimedEventContainer from "src/components/timed-event-container";
import TimeIndicator from "src/components/time-indicator";
import NewEventContainer from "src/components/new-event-container";
import EditEventContainer from "src/components/edit-event-container";

type TimedEventsProps = {
  refNewEvent: RefObject<any>;
};

const TimedEvents = ({ refNewEvent }: TimedEventsProps) => {
  const {
    theme,
    canCreateEvents,
    canEditEvent,
    timeFormat,
    layout,
    showTimeIndicator,
  } = useContext(ConfigProvider);
  const hours = useMemo(() => generatePrefabHours(timeFormat), [timeFormat]);

  return (
    <View style={[styles.container, theme?.timedEventsContainer]}>
      <BackgroundHoursLayout hours={hours} />
      <View style={styles.backgroundContainer}>
        <BackgroundHoursContent hours={hours} />
        {layout.partDayEventsLayout.map((partDayLayout) => (
          <TimedEventContainer
            key={partDayLayout.event.id}
            layout={partDayLayout}
            refNewEvent={refNewEvent}
          />
        ))}
        {showTimeIndicator ? <TimeIndicator /> : null}
        {canEditEvent ? <EditEventContainer refNewEvent={refNewEvent} /> : null}
      </View>
      {canCreateEvents ? <NewEventContainer /> : null}
    </View>
  );
};

export default TimedEvents;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    marginBottom: 30,
    marginTop: 10,
  },
  backgroundContainer: {
    position: "relative",
    marginTop: -TOP_MARGIN_PIXEL_OFFSET,
    flexDirection: "column",
    flex: 1,
    paddingRight: 10,
    overflow: "hidden",
  },
});
