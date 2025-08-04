import Animated, {
  runOnJS,
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
};

// This fraction determines how quickly zoom grows
const fraction = 0.1;

export default function ZoomProvider({ children }: ZoomProviderProps) {
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

      const newScale = previewScale.value * (1 + fraction * (event.scale - 1));

      zoomLevel.value = Math.min(
        maxZoomLevel,
        Math.max(minZoomLevel, newScale)
      );
      previewScale.value = zoomLevel.value;
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
    doubleTapGesture(zoomLevel, defaultZoomLevel, onZoomChange)
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
