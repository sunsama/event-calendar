import Animated, {
  type AnimatedRef,
  type SharedValue,
  runOnJS,
  scrollTo,
  useAnimatedReaction,
  useSharedValue,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useContext } from "react";
import { ConfigProvider } from "../utils/globals";
import { StyleSheet } from "react-native";
import doubleTapGesture from "../utils/double-tap-reset-zoom-gesture";

type ZoomProviderProps = {
  children: any;
  scrollY: SharedValue<number>;
  scrollRef: AnimatedRef<Animated.ScrollView>;
  scrollViewHeight: SharedValue<number>;
};

// This fraction determines how quickly zoom grows
const fraction = 0.5;
// Minimum zoom change to commit — reduces cascading layout recalculations
const ZOOM_STEP = 0.005;

export default function ZoomProvider({
  children,
  scrollY,
  scrollRef,
  scrollViewHeight,
}: ZoomProviderProps) {
  const {
    zoomLevel,
    defaultZoomLevel,
    maxZoomLevel,
    minZoomLevel,
    maximumHour,
    onZoomChange,
  } = useContext(ConfigProvider);
  const previewScale = useSharedValue(zoomLevel.get());
  const focalTime = useSharedValue(0);
  const screenFocalY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onStart((event) => {
      "worklet";
      previewScale.value = zoomLevel.value;
      focalTime.value = event.focalY / zoomLevel.value;
      screenFocalY.value = event.focalY - scrollY.value;
    })
    .onUpdate((event) => {
      "worklet";

      const rawScale = previewScale.value * (1 + fraction * (event.scale - 1));
      const clamped = Math.min(maxZoomLevel, Math.max(minZoomLevel, rawScale));
      const newZoom = Math.round(clamped / ZOOM_STEP) * ZOOM_STEP;

      if (newZoom === zoomLevel.value) return;

      const maxScrollY = newZoom * 1440 - scrollViewHeight.value;
      const newScrollY = Math.min(
        Math.max(0, maxScrollY),
        Math.max(0, focalTime.value * newZoom - screenFocalY.value)
      );

      scrollTo(scrollRef, 0, newScrollY, false);
      scrollY.value = newScrollY;
      zoomLevel.value = newZoom;
    })
    .onEnd(() => {
      if (onZoomChange) {
        runOnJS(onZoomChange)(zoomLevel.value);
      }
    });

  useAnimatedReaction(
    () => zoomLevel.value,
    (zoom) => {
      maximumHour.value = 1440 * zoom;
    },
    [maximumHour]
  );

  const combinedGesture = Gesture.Simultaneous(
    pinchGesture,
    doubleTapGesture(
      zoomLevel,
      defaultZoomLevel,
      onZoomChange,
      scrollY,
      scrollRef,
      scrollViewHeight
    )
  );

  return (
    <GestureDetector gesture={combinedGesture}>
      <Animated.View style={styles.container}>{children}</Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
