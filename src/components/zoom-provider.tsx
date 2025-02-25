import Animated, { runOnJS, useSharedValue } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useContext, useEffect, useRef } from "react";
import {
  ConfigProvider,
  DEFAULT_MINUTE_HEIGHT,
  TOP_MARGIN_PIXEL_OFFSET,
} from "src/utils/globals";
import { StyleSheet } from "react-native";
import useIsEditing from "src/hooks/use-is-editing";

type ZoomProviderProps = {
  children: any;
};

// This fraction determines how quickly zoom grows
const fraction = 0.1;

const ZoomProvider = ({ children }: ZoomProviderProps) => {
  const config = useContext(ConfigProvider);
  const previewScale = useSharedValue(-1);

  useEffect(() => {
    previewScale.value = config.zoomLevel.get();
  }, [config.zoomLevel, previewScale]);

  const pinchGesture = useRef(
    Gesture.Pinch().onUpdate((event) => {
      "worklet";

      const newScale = previewScale.value * (1 + fraction * (event.scale - 1));

      config.zoomLevel.value = Math.min(3, Math.max(0.54, newScale));
      previewScale.value = config.zoomLevel.value;
    })
  );

  const doubleTapGesture = useRef(
    Gesture.Tap()
      .numberOfTaps(2)
      .onEnd((_event, success) => {
        if (success) {
          // Reset the zoom level to the default
          config.zoomLevel.value = DEFAULT_MINUTE_HEIGHT;
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
          config.createY.value = -1;
          isDragging.value = false;
          yPosition.value = -1;
          // console.log("BackgroundHoursLayout gesture start is editing");
          return;
        }

        isDragging.value = true;
        config.createY.value =
          event.y - TOP_MARGIN_PIXEL_OFFSET - (config.zoomLevel.value * 60) / 2;
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

        config.createY.value =
          event.allTouches[0].y -
          TOP_MARGIN_PIXEL_OFFSET -
          (config.zoomLevel.value * 60) / 2;
        // console.log("BackgroundHoursLayout gesture move", event.allTouches[0].y);
      })
      .onEnd((event, success) => {
        "worklet";

        if (!isDragging.value) {
          return;
        }
        // console.log("BackgroundHoursLayout gesture end", event.y, success);
        // Make sure it doesn't show the new event component anymore
        config.createY.value = -1;
        yPosition.value = -1;
        isDragging.value = false;

        if (!success) {
          // console.log("BackgroundHoursLayout gesture end not success");
          return;
        }

        // Determine the hour that was clicked and trigger the event creation
        const normalizedY =
          event.y - TOP_MARGIN_PIXEL_OFFSET - (config.zoomLevel.value * 60) / 2;
        const time = Math.floor(normalizedY / config.zoomLevel.value);
        const hour = Math.floor(time / 60);
        const minute = time - hour * 60;

        // console.log(
        //   "BackgroundHoursLayout gesture end success",
        //   hour,
        //   minute,
        //   !!config.onCreateEvent
        // );

        if (config.onCreateEvent) {
          runOnJS(config.onCreateEvent)({
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
