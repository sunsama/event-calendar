import Animated, {
  type AnimatedRef,
  type SharedValue,
  runOnJS,
  scrollTo,
  useAnimatedReaction,
  useSharedValue,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useContext, useEffect } from "react";
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
const fraction = 0.1;

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
  const previewScale = useSharedValue(-1);

  useEffect(() => {
    previewScale.value = zoomLevel.get();
  }, [zoomLevel, previewScale]);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      "worklet";

      const oldZoom = zoomLevel.value;
      const newScale = previewScale.value * (1 + fraction * (event.scale - 1));
      const newZoom = Math.min(maxZoomLevel, Math.max(minZoomLevel, newScale));

      if (newZoom !== oldZoom) {
        const ratio = newZoom / oldZoom;
        const viewportFocalY = event.focalY - scrollY.value;
        const maxScrollY = newZoom * 1440 - scrollViewHeight.value;
        const newScrollY = Math.min(
          Math.max(0, maxScrollY),
          Math.max(0, (scrollY.value + viewportFocalY) * ratio - viewportFocalY)
        );

        scrollTo(scrollRef, 0, newScrollY, false);
        scrollY.value = newScrollY;
      }

      zoomLevel.value = newZoom;
      previewScale.value = newZoom;
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
