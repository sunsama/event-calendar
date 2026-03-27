import Animated, {
  SharedValue,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { ReactNode, type RefObject, useContext, useMemo } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import type { CalendarEvent } from "src/types";
import { useIsEditing } from "../hooks/use-is-editing";
import { ConfigProvider } from "../utils/globals";
import useAutoScroll from "../hooks/use-auto-scroll";

type DragBarProps<T extends CalendarEvent> = {
  top?: SharedValue<number>;
  height: SharedValue<number>;
  render: (event: T) => ReactNode;
  refMainContainer: RefObject<any>;
  fiveMinuteInterval?: boolean;
  zoomLevel: SharedValue<number>;
  maximumHour: SharedValue<number>;
  event: T;
};

const handleTopDrag = (
  top: SharedValue<number>,
  fiveMinuteInterval: boolean | undefined,
  startY: SharedValue<number>,
  translationY: number,
  zoomLevel: SharedValue<number>,
  maximumHour: SharedValue<number>,
  height: SharedValue<number>
) => {
  "worklet";

  const originalY = top.value;

  let freshUpdatedStartTime;

  if (fiveMinuteInterval) {
    // Set the updated time in 15 minute increments but make sure we never go lower
    // than the first minute of the day
    const rawMinutes = startY.value + translationY / zoomLevel.value;
    const snappedMinutes = Math.round(rawMinutes / 5) * 5;

    freshUpdatedStartTime = Math.max(0, snappedMinutes);
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

  // Make sure to have a minimum of 5 minutes
  height.value = Math.max(
    height.value + (originalY - top.value),
    5 * zoomLevel.value
  );
};

const handleBottomDrag = (
  fiveMinuteInterval: boolean | undefined,
  startY: SharedValue<number>,
  translationY: number,
  zoomLevel: SharedValue<number>,
  height: SharedValue<number>
) => {
  "worklet";

  let freshUpdatedEndTime;

  if (fiveMinuteInterval) {
    // Set the updated time in 15 minute increments but make sure we never go lower
    // than the first minute of the day
    const rawMinutes = startY.value + translationY / zoomLevel.value;
    const snappedMinutes = Math.round(rawMinutes / 5) * 5;

    freshUpdatedEndTime = Math.max(0, snappedMinutes);
  } else {
    // Set the updated time in 1 minute increments but make sure we never go lower
    // than the first minute of the day
    freshUpdatedEndTime = Math.max(
      0,
      startY.value +
        Math.floor(translationY / zoomLevel.value) * zoomLevel.value
    );
  }

  height.value = Math.max(freshUpdatedEndTime, 5 * zoomLevel.value);
};

const DragBar = <T extends CalendarEvent>({
  event,
  top,
  height,
  render,
  refMainContainer,
  fiveMinuteInterval,
  zoomLevel,
  maximumHour,
}: DragBarProps<T>) => {
  const { currentY } = useIsEditing();
  const { scrollRef, scrollY, scrollViewHeight } = useContext(ConfigProvider);

  const startY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const autoScrollOffset = useSharedValue(0);

  const dragEdge = useDerivedValue(() =>
    top ? top.value : currentY.value + height.value
  );

  useAutoScroll({
    scrollRef,
    scrollY,
    scrollViewHeight,
    maximumHour,
    topEdgeY: dragEdge,
    bottomEdgeY: dragEdge,
    isActive: isDragging,
    autoScrollOffset,
    positionY: top || undefined,
    heightValue: height,
    invertHeight: !!top,
  });

  const gesturePan = Gesture.Pan()
    .blocksExternalGesture(refMainContainer)
    .onStart(() => {
      startY.value = top ? top.value : height.value;
      autoScrollOffset.value = 0;
      isDragging.value = true;
    })
    .onUpdate(({ translationY }) => {
      const effectiveTranslation = translationY + autoScrollOffset.value;

      if (top) {
        handleTopDrag(
          top,
          fiveMinuteInterval,
          startY,
          effectiveTranslation,
          zoomLevel,
          maximumHour,
          height
        );

        return;
      }

      handleBottomDrag(
        fiveMinuteInterval,
        startY,
        effectiveTranslation,
        zoomLevel,
        height
      );
    })
    .onFinalize(() => {
      isDragging.value = false;
    });

  const styleDragBar = useMemo(
    () => ({
      bottom: !top ? 0 : undefined,
      top: top ? 0 : undefined,
    }),
    [top]
  );

  const renderedComponent = useMemo(() => render(event), [render, event]);

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
