import { memo, useCallback, useContext, useState } from "react";
import { ConfigProvider } from "src/utils/globals";
import { StyleSheet, Text, View } from "react-native";
import EventContainer from "src/components/event-container";
import { Pressable } from "react-native-gesture-handler";

const AllDayEvents = memo(
  () => {
    const { layout, theme, maxAllDayEvents } = useContext(ConfigProvider);
    const [showAllDayEvents, setShowAllDayEvents] = useState(false);

    const onPress = useCallback(
      () => setShowAllDayEvents((state) => !state),
      []
    );

    const allDayEvents = showAllDayEvents
      ? layout.allDayEventsLayout
      : layout.allDayEventsLayout.slice(0, maxAllDayEvents);
    const restEventAmount =
      layout.allDayEventsLayout.length - allDayEvents.length;

    return (
      <View style={[styles.container, theme?.allDayContainer]}>
        <View style={[styles.eventContainer, theme?.allDayEventContainer]}>
          {allDayEvents.map((allDayLayout) => (
            <EventContainer key={allDayLayout.event.id} layout={allDayLayout} />
          ))}
          {layout.allDayEventsLayout.length > maxAllDayEvents ? (
            <Pressable onPress={onPress}>
              <View
                style={[styles.moreContainer, theme?.allDayShowMoreContainer]}
              >
                <Text
                  style={[styles.moreContainerText, theme?.allDayShowMoreText]}
                >
                  {restEventAmount ? `${restEventAmount} more` : "Show less"}
                </Text>
              </View>
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  },
  () => true
);

export default AllDayEvents;

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "black",
  },
  eventContainer: {
    marginLeft: 50,
    marginRight: 10,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderColor: "black",
  },
  moreContainer: {
    padding: 5,
  },
  moreContainerText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "grey",
  },
});
