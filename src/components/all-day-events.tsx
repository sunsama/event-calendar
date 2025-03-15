import { memo, useCallback, useContext, useState } from "react";
import { ConfigProvider, DEFAULT_MINUTE_HEIGHT } from "../utils/globals";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import EventContainer from "../components/event-container";
import { Pressable } from "react-native-gesture-handler";
import Animated, {
  measure,
  runOnJS,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import type { AllDayEventLayoutType } from "src/types";

const AllDayEvents = memo(
  () => {
    const { layout, theme, maxAllDayEvents, onCreateEvent, canCreateEvents } =
      useContext(ConfigProvider);
    const [showAllDayEvents, setShowAllDayEvents] = useState(false);

    const measuredHeight = useSharedValue(0);
    const originalHeight = useSharedValue(0);

    const onPressShowMore = useCallback(() => {
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

    const onPressCreateEvent = useCallback(() => {
      if (canCreateEvents && onCreateEvent) {
        onCreateEvent({ isAllDay: true });
      }
    }, [canCreateEvents, onCreateEvent]);

    const allDayEvents = showAllDayEvents
      ? layout.allDayEventsLayout
      : layout.allDayEventsLayout.slice(0, maxAllDayEvents);
    const restEventAmount =
      layout.allDayEventsLayout.length - allDayEvents.length;

    const moreAvailable = layout.allDayEventsLayout.length > maxAllDayEvents;

    const refView = useAnimatedRef();
    const onContentLayout = useCallback(
      (e: LayoutChangeEvent) => {
        const { height } = e.nativeEvent.layout;

        if (!originalHeight.value) {
          originalHeight.value = height;
          measuredHeight.value = height;
          return;
        }

        measuredHeight.value = withTiming(height, { duration: 250 }, () => {
          if (!moreAvailable) {
            return;
          }

          // Once we have done the animation we need to measure the height as
          // the height might have changed due to the amount of events
          const measured = measure(refView);

          if (measured?.height && measured.height !== originalHeight.value) {
            originalHeight.value = measured.height;
          }
        });
      },
      [originalHeight, measuredHeight, refView, moreAvailable]
    );

    const animatedStyle = useAnimatedStyle(() => {
      return {
        minHeight: 1,
        height: measuredHeight.value,
      };
    });

    return (
      <View style={[styles.container, theme?.allDayContainer]}>
        <View style={[styles.eventContainer, theme?.allDayEventContainer]}>
          <Animated.View style={animatedStyle} ref={refView}>
            <View onLayout={onContentLayout}>
              {allDayEvents.map((allDayLayout: AllDayEventLayoutType<any>) => (
                <EventContainer
                  key={allDayLayout.event.id}
                  layout={allDayLayout}
                />
              ))}
            </View>
          </Animated.View>
          {moreAvailable ? (
            <Pressable onPress={onPressShowMore}>
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
          ) : (
            <Pressable onPress={onPressCreateEvent}>
              <View style={[styles.deadSpace, theme?.allDayDeadSpace]} />
            </Pressable>
          )}
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
  deadSpace: {
    height: DEFAULT_MINUTE_HEIGHT * 24,
  },
});
