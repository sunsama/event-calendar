import {
  type AnimatedRef,
  scrollTo,
  type SharedValue,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import type { ScrollView } from "react-native-gesture-handler";
import { useMemo } from "react";

const SCROLL_OFFSET_TOLERANCE = 2;
const SCROLL_THRESHOLD = 25;
const SCROLL_SPEED = 100;

const useAutoScrolling = (
  refScrollView: AnimatedRef<ScrollView>,
  currentY: SharedValue<number>,
  editorContainerHeight: SharedValue<number>
) => {
  const scrollTarget = useSharedValue(-1);
  const contentHeight = useSharedValue(0);
  const scrollOffset = useSharedValue(0);
  const layoutHeight = useSharedValue(0);

  const hoverScreenOffset = useDerivedValue(() => {
    return currentY.value - scrollOffset.value;
  }, []);

  const scrollPositionTop = useDerivedValue(() => {
    return Math.max(0, hoverScreenOffset.value);
  }, []);

  const scrollPositionBottom = useDerivedValue(() => {
    console.info(
      "scrollPositionBottom:",
      layoutHeight.value,
      hoverScreenOffset.value,
      editorContainerHeight.value
    );
    const hoverPlusActiveCell =
      hoverScreenOffset.value + editorContainerHeight.value;
    return Math.max(0, layoutHeight.value - hoverPlusActiveCell);
  }, []);

  useAnimatedReaction(
    () => currentY.value > -1,
    (fresh, previous) => {
      if (fresh !== previous) {
        scrollTarget.value = scrollOffset.value;
      }
    }
  );

  const isAtTopEdge = useDerivedValue(() => {
    return scrollPositionTop.value <= SCROLL_THRESHOLD;
  });

  // const isAtBottomEdge = useDerivedValue(() => {
  //   return scrollPositionBottom.value <= SCROLL_THRESHOLD;
  // }, []);

  const shouldAutoScroll = useDerivedValue(() => {
    const canIgniteScroll =
      Math.abs(scrollOffset.value - scrollTarget.value) <
      SCROLL_OFFSET_TOLERANCE;

    if (
      currentY.value === -1 ||
      !canIgniteScroll ||
      !layoutHeight.value ||
      !contentHeight.value
    ) {
      return "none";
    }

    if (scrollPositionTop.value < SCROLL_THRESHOLD) {
      return "top";
    }

    if (scrollPositionBottom.value < SCROLL_THRESHOLD) {
      return "bottom";
    }

    return "none";
  });

  useAnimatedReaction(
    () => shouldAutoScroll.value,
    (autoScroll) => {
      if (autoScroll === "none") {
        return;
      }

      const distFromEdge = isAtTopEdge.value
        ? scrollPositionTop.value
        : scrollPositionBottom.value;
      const speedPct = 1 - distFromEdge / SCROLL_THRESHOLD!;
      const offset = speedPct * SCROLL_SPEED;

      scrollTarget.value =
        autoScroll === "top"
          ? Math.max(0, scrollOffset.value - offset)
          : Math.min(
              scrollOffset.value + offset,
              contentHeight.value - layoutHeight.value
            );

      scrollTo(refScrollView, 0, scrollTarget.value, false);
    }
  );

  return useMemo(
    () => [contentHeight, layoutHeight, scrollOffset],
    [contentHeight, layoutHeight, scrollOffset]
  );
};

export default useAutoScrolling;
