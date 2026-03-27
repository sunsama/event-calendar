import Animated, {
  type AnimatedRef,
  type SharedValue,
  scrollTo,
  useFrameCallback,
} from "react-native-reanimated";

const AUTO_SCROLL_TOP_THRESHOLD = 80;
const AUTO_SCROLL_BOTTOM_THRESHOLD = 150;
const AUTO_SCROLL_MAX_SPEED = 8;

type AutoScrollParams = {
  scrollRef: AnimatedRef<Animated.ScrollView>;
  scrollY: SharedValue<number>;
  scrollViewHeight: SharedValue<number>;
  maximumHour: SharedValue<number>;
  topEdgeY: SharedValue<number>;
  bottomEdgeY: SharedValue<number>;
  isActive: SharedValue<boolean>;
  autoScrollOffset?: SharedValue<number>;
  positionY?: SharedValue<number>;
  heightValue?: SharedValue<number>;
  invertHeight?: boolean;
};

export default function useAutoScroll({
  scrollRef,
  scrollY,
  scrollViewHeight,
  maximumHour,
  topEdgeY,
  bottomEdgeY,
  isActive,
  autoScrollOffset,
  positionY,
  heightValue,
  invertHeight,
}: AutoScrollParams) {
  useFrameCallback(() => {
    if (!isActive.value) return;

    const viewportTop = scrollY.value;
    const viewportBottom = scrollY.value + scrollViewHeight.value;

    let scrollDelta = 0;

    const distFromTop = topEdgeY.value - viewportTop;
    const distFromBottom = viewportBottom - bottomEdgeY.value;

    if (
      distFromTop < AUTO_SCROLL_TOP_THRESHOLD &&
      distFromTop <= distFromBottom
    ) {
      const ratio = Math.max(0, 1 - distFromTop / AUTO_SCROLL_TOP_THRESHOLD);
      scrollDelta = -ratio * AUTO_SCROLL_MAX_SPEED;
    } else if (distFromBottom < AUTO_SCROLL_BOTTOM_THRESHOLD) {
      const ratio = Math.max(
        0,
        1 - distFromBottom / AUTO_SCROLL_BOTTOM_THRESHOLD
      );
      scrollDelta = ratio * AUTO_SCROLL_MAX_SPEED;
    }

    if (scrollDelta === 0) return;

    const maxScrollY = Math.max(0, maximumHour.value - scrollViewHeight.value);
    const newScrollY = Math.min(
      maxScrollY,
      Math.max(0, scrollY.value + scrollDelta)
    );
    const actualDelta = newScrollY - scrollY.value;

    if (Math.abs(actualDelta) < 0.5) return;

    scrollTo(scrollRef, 0, newScrollY, false);
    scrollY.value = newScrollY;

    if (positionY) {
      positionY.value += actualDelta;
    }
    if (autoScrollOffset) {
      autoScrollOffset.value += actualDelta;
    }
    if (heightValue) {
      heightValue.value += invertHeight ? -actualDelta : actualDelta;
    }
  });
}
