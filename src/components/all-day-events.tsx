import { memo, useCallback, useContext, useState } from "react";
import { ConfigProvider } from "../utils/globals";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import EventContainer from "../components/event-container";
import { Pressable } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const AllDayEvents = memo(
  () => {
    const { layout, theme, maxAllDayEvents } = useContext(ConfigProvider);
    const [showAllDayEvents, setShowAllDayEvents] = useState(false);

    const measuredHeight = useSharedValue(0);
    const originalHeight = useSharedValue(0);

    const onPress = useCallback(() => {
      const newState = !showAllDayEvents;

      if (!newState) {
        measuredHeight.value = withTiming(
          originalHeight.value,
          {
            duration: 250,
          },
          () => {
            runOnJS(setShowAllDayEvents)(newState);
          }
        );
      } else {
        setShowAllDayEvents(newState);
      }
    }, [measuredHeight, originalHeight, showAllDayEvents]);

    const allDayEvents = showAllDayEvents
      ? layout.allDayEventsLayout
      : layout.allDayEventsLayout.slice(0, maxAllDayEvents);
    const restEventAmount =
      layout.allDayEventsLayout.length - allDayEvents.length;

    // Called whenever the content inside changes layout
    const onContentLayout = useCallback(
      (e: LayoutChangeEvent) => {
        const { height } = e.nativeEvent.layout;

        if (!originalHeight.value) {
          originalHeight.value = height;
          measuredHeight.value = height;
          return;
        }

        // Animate from the old height to the new height
        measuredHeight.value = withTiming(height, { duration: 250 });
      },
      [measuredHeight, originalHeight]
    );

    // Apply the animated height to the wrapping container
    const animatedStyle = useAnimatedStyle(() => {
      return {
        // This ensures the container’s height animates smoothly
        height: measuredHeight.value,
      };
    });

    return (
      <View style={[styles.container, theme?.allDayContainer]}>
        <View style={[styles.eventContainer, theme?.allDayEventContainer]}>
          <Animated.View
            style={[
              animatedStyle,
              {
                overflow: "hidden", // so children get clipped during animation
                backgroundColor: "lightgrey",
                minHeight: 1,
              },
            ]}
          >
            <View onLayout={onContentLayout}>
              {allDayEvents.map((allDayLayout) => (
                <EventContainer
                  key={allDayLayout.event.id}
                  layout={allDayLayout}
                />
              ))}
            </View>
          </Animated.View>
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
    overflow: "hidden",
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
