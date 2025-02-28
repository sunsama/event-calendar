import Animated, { SharedValue, useSharedValue } from "react-native-reanimated";
import { ReactNode, useMemo } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";

type DragBarProps = {
  top?: SharedValue<number>;
  height: SharedValue<number>;
  render: () => ReactNode;
  refMainContainer: React.RefObject<any>;
  fiveMinuteInterval?: boolean;
  zoomLevel: SharedValue<number>;
  maximumHour: SharedValue<number>;
};

const DragBar = ({
  top,
  height,
  render,
  refMainContainer,
  fiveMinuteInterval,
  zoomLevel,
  maximumHour,
}: DragBarProps) => {
  const startY = useSharedValue(0);

  const gesturePan = Gesture.Pan()
    .blocksExternalGesture(refMainContainer)
    .onStart(() => {
      startY.value = top ? top.value : height.value;
    })
    .onUpdate(({ translationY }) => {
      if (top) {
        const originalY = top.value;

        let freshUpdatedStartTime;

        if (fiveMinuteInterval) {
          // Set the updated time in 15 minute increments but make sure we never go lower
          // than the first minute of the day
          freshUpdatedStartTime = Math.max(
            0,
            startY.value +
              Math.floor(translationY / zoomLevel.value / 5) *
                (zoomLevel.value * 5)
          );
        } else {
          // Set the updated time in 1 minute increments but make sure we never go lower
          // than the first minute of the day
          freshUpdatedStartTime = Math.max(
            0,
            startY.value +
              Math.floor(translationY / zoomLevel.value) * zoomLevel.value
          );
        }

        // Make sure the event does not span after midnight, and if so make sure it
        // is limited to exactly midnight
        if (freshUpdatedStartTime > maximumHour.value - height.value) {
          freshUpdatedStartTime = maximumHour.value - height.value;
        }

        top.value = freshUpdatedStartTime;
        height.value = height.value + (originalY - top.value);

        return;
      }

      let freshUpdatedEndTime;

      if (fiveMinuteInterval) {
        // Set the updated time in 15 minute increments but make sure we never go lower
        // than the first minute of the day
        freshUpdatedEndTime = Math.max(
          0,
          startY.value +
            Math.floor(translationY / zoomLevel.value / 5) *
              (zoomLevel.value * 5)
        );
      } else {
        // Set the updated time in 1 minute increments but make sure we never go lower
        // than the first minute of the day
        freshUpdatedEndTime = Math.max(
          0,
          startY.value +
            Math.floor(translationY / zoomLevel.value) * zoomLevel.value
        );
      }

      height.value = freshUpdatedEndTime;
    });

  const styleDragBar = useMemo(
    () => ({
      bottom: !top ? 0 : undefined,
      top: top ? 0 : undefined,
    }),
    [top]
  );

  const renderedComponent = useMemo(render, [render]);

  return (
    <GestureDetector gesture={gesturePan}>
      <Animated.View style={[styles.dragBar, styleDragBar]}>
        {renderedComponent}
      </Animated.View>
    </GestureDetector>
  );
};

export default DragBar;

const styles = StyleSheet.create({
  dragBar: {
    position: "absolute",
    left: 0,
    right: 0,
  },
});
