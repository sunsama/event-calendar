import { Gesture } from "react-native-gesture-handler";
import Animated, {
  type AnimatedRef,
  type SharedValue,
  runOnJS,
  scrollTo,
} from "react-native-reanimated";
import { type CalendarEvent, Config } from "../types";

const doubleTapGesture = <T extends CalendarEvent>(
  zoomLevel: SharedValue<number>,
  initialZoomLevel: number,
  onZoomChange?: Config<T>["onZoomChange"],
  scrollY?: SharedValue<number>,
  scrollRef?: AnimatedRef<Animated.ScrollView>,
  scrollViewHeight?: SharedValue<number>
) =>
  Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((event, success) => {
      if (success) {
        if (scrollY && scrollRef && scrollViewHeight) {
          const oldZoom = zoomLevel.value;
          const newZoom = initialZoomLevel;
          const ratio = newZoom / oldZoom;
          const viewportFocalY = event.y - scrollY.value;
          const maxScrollY = newZoom * 1440 - scrollViewHeight.value;
          const newScrollY = Math.min(
            Math.max(0, maxScrollY),
            Math.max(
              0,
              (scrollY.value + viewportFocalY) * ratio - viewportFocalY
            )
          );

          scrollTo(scrollRef, 0, newScrollY, false);
          scrollY.value = newScrollY;
        }

        zoomLevel.value = initialZoomLevel;

        if (onZoomChange) {
          runOnJS(onZoomChange)(initialZoomLevel);
        }
      }
    });

export default doubleTapGesture;
