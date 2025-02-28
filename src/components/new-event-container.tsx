import { memo, useContext, useMemo, useState } from "react";
import { ConfigProvider, TOP_MARGIN_PIXEL_OFFSET } from "src/utils/globals";
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
} from "react-native-reanimated";
import { StyleSheet, View } from "react-native";
import { useIsEditing } from "src/hooks/use-is-editing";

const NewEventContainer = memo(
  () => {
    const {
      fiveMinuteInterval,
      renderNewEventContainer,
      zoomLevel,
      createY,
      theme,
    } = useContext(ConfigProvider);

    const { isEditing } = useIsEditing();

    const styleVisible = useAnimatedStyle(() => {
      return {
        opacity: !isEditing && createY.value >= 0 ? 1 : 0,
        transform: [
          {
            translateY: createY.value - TOP_MARGIN_PIXEL_OFFSET,
          },
        ],
        height: zoomLevel.value * 60,
      };
    }, [isEditing]);

    const [[hour, minute], setTime] = useState([0, 0]);

    const hasRenderEvent = useMemo(
      () => !!renderNewEventContainer,
      [renderNewEventContainer]
    );

    useAnimatedReaction(
      () => ({ zoomLevel: zoomLevel.value, createY: createY.value }),
      (state) => {
        if (!hasRenderEvent) {
          return;
        }

        const freshTime = Math.floor(state.createY / state.zoomLevel);
        const freshHour = Math.floor(freshTime / 60);
        const freshMinute = !fiveMinuteInterval
          ? freshTime - freshHour * 60
          : Math.round(freshTime / 5) * 5 - freshHour * 60;

        runOnJS(setTime)([freshHour, freshMinute]);
      },
      []
    );

    return (
      <Animated.View style={[styles.container, styleVisible]}>
        {renderNewEventContainer ? (
          renderNewEventContainer(hour, minute)
        ) : (
          <View style={[styles.defaultContainer, theme?.newEventContainer]} />
        )}
      </Animated.View>
    );
  },
  () => true
);

export default NewEventContainer;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 51,
    right: 10,
    height: 50,
  },
  defaultContainer: {
    flex: 1,
    borderRadius: 3,
    padding: 5,
    backgroundColor: "pink",
    opacity: 0.8,
  },
});
