import { memo, useContext } from "react";
import { ConfigProvider } from "src/utils/globals";
import { StyleSheet, View } from "react-native";
import EventContainer from "src/components/event-container";

const AllDayEvents = memo(
  () => {
    const { layout, theme } = useContext(ConfigProvider);

    return (
      <View style={[styles.container, theme?.allDayContainer]}>
        <View style={[styles.eventContainer, theme?.allDayEventContainer]}>
          {layout.allDayEventsLayout.map((allDayLayout) => (
            <EventContainer key={allDayLayout.event.id} layout={allDayLayout} />
          ))}
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
});
