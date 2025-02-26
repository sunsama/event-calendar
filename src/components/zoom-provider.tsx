import Animated, { runOnJS, useSharedValue } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useContext, useEffect, useRef } from "react";
import { ConfigProvider, TOP_MARGIN_PIXEL_OFFSET } from "src/utils/globals";
import { StyleSheet } from "react-native";
import useIsEditing from "src/hooks/use-is-editing";

type ZoomProviderProps = {
  children: any;
};

// This fraction determines how quickly zoom grows
const fraction = 0.1;

const ZoomProvider = ({ children }: ZoomProviderProps) => {
  const { zoomLevel, initialZoomLevel, createY, onCreateEvent } =
    useContext(ConfigProvider);
  const previewScale = useSharedValue(-1);

  useEffect(() => {
    previewScale.value = zoomLevel.get();
  }, [zoomLevel, previewScale]);

  const pinchGesture = useRef(
    Gesture.Pinch().onUpdate((event) => {
      "worklet";

      const newScale = previewScale.value * (1 + fraction * (event.scale - 1));

      zoomLevel.value = Math.min(3, Math.max(0.54, newScale));
      previewScale.value = zoomLevel.value;
    })
  );

  const doubleTapGesture = useRef(
    Gesture.Tap()
      .numberOfTaps(2)
      .onEnd((_event, success) => {
        if (success) {
          // Reset the zoom level to the default
          zoomLevel.value = initialZoomLevel;
        }
      })
  );

  const yPosition = useSharedValue(-1);
  const editing = useIsEditing();
  const isDragging = useSharedValue(false);

  const longPressGesture = useRef(
    Gesture.LongPress()
      .numberOfPointers(1)
      .minDuration(500)
      .maxDistance(10000)
      .onStart((event) => {
        "worklet";

        if (editing) {
          createY.value = -1;
          isDragging.value = false;
          yPosition.value = -1;
          // console.log("BackgroundHoursLayout gesture start is editing");
          return;
        }

        isDragging.value = true;
        createY.value =
          event.y - TOP_MARGIN_PIXEL_OFFSET - (zoomLevel.value * 60) / 2;
        // console.log(
        //   "BackgroundHoursLayout gesture start is not editing",
        //   event.y
        // );
      })
      .onTouchesMove((event) => {
        "worklet";

        if (!isDragging.value) {
          return;
        }

        createY.value =
          event.allTouches[0].y -
          TOP_MARGIN_PIXEL_OFFSET -
          (zoomLevel.value * 60) / 2;
        // console.log("BackgroundHoursLayout gesture move", event.allTouches[0].y);
      })
      .onEnd((event, success) => {
        "worklet";

        if (!isDragging.value) {
          return;
        }
        // console.log("BackgroundHoursLayout gesture end", event.y, success);
        // Make sure it doesn't show the new event component anymore
        createY.value = -1;
        yPosition.value = -1;
        isDragging.value = false;

        if (!success) {
          // console.log("BackgroundHoursLayout gesture end not success");
          return;
        }

        // Determine the hour that was clicked and trigger the event creation
        const normalizedY =
          event.y - TOP_MARGIN_PIXEL_OFFSET - (zoomLevel.value * 60) / 2;
        const time = Math.floor(normalizedY / zoomLevel.value);
        const hour = Math.floor(time / 60);
        const minute = time - hour * 60;

        // console.log(
        //   "BackgroundHoursLayout gesture end success",
        //   hour,
        //   minute,
        //   !!config.onCreateEvent
        // );

        if (onCreateEvent) {
          runOnJS(onCreateEvent)({
            hour,
            minute,
          });
        }
      })
  );

  const combinedGesture = Gesture.Simultaneous(
    pinchGesture.current,
    longPressGesture.current,
    doubleTapGesture.current
  );

  return (
    <GestureDetector gesture={combinedGesture}>
      <Animated.View style={styles.container}>{children}</Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ZoomProvider;
