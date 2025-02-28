import Animated, { runOnJS, useSharedValue } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { forwardRef, useContext, useEffect } from "react";
import { ConfigProvider, TOP_MARGIN_PIXEL_OFFSET } from "src/utils/globals";
import { StyleSheet } from "react-native";
import { GestureRef } from "react-native-gesture-handler/lib/typescript/handlers/gestures/gesture";
import { useIsEditing } from "src/hooks/use-is-editing";

type ZoomProviderProps = {
  children: any;
};

// This fraction determines how quickly zoom grows
const fraction = 0.1;

const ZoomProvider = forwardRef<GestureRef, ZoomProviderProps>(
  ({ children }, refNewEvent) => {
    const {
      canCreateEvents,
      zoomLevel,
      initialZoomLevel,
      createY,
      onCreateEvent,
    } = useContext(ConfigProvider);
    const previewScale = useSharedValue(-1);

    useEffect(() => {
      previewScale.value = zoomLevel.get();
    }, [zoomLevel, previewScale]);

    const pinchGesture = Gesture.Pinch().onUpdate((event) => {
      "worklet";

      const newScale = previewScale.value * (1 + fraction * (event.scale - 1));

      zoomLevel.value = Math.min(3, Math.max(0.54, newScale));
      previewScale.value = zoomLevel.value;
    });

    const doubleTapGesture = Gesture.Tap()
      .numberOfTaps(2)
      .onEnd((_event, success) => {
        if (success) {
          // Reset the zoom level to the default
          zoomLevel.value = initialZoomLevel;
        }
      });

    const yPosition = useSharedValue(-1);
    const { isEditing } = useIsEditing();
    const isDragging = useSharedValue(false);

    const longPressGesture = Gesture.LongPress()
      .enabled(canCreateEvents && !isEditing)
      .withRef(refNewEvent as any)
      .numberOfPointers(1)
      .minDuration(500)
      .maxDistance(10000)
      .onStart((event) => {
        "worklet";

        isDragging.value = true;
        createY.value = Math.max(
          0,
          event.y - TOP_MARGIN_PIXEL_OFFSET - (zoomLevel.value * 60) / 2
        );
      })
      .onTouchesMove((event) => {
        "worklet";

        if (!isDragging.value) {
          return;
        }

        createY.value = Math.max(
          0,
          event.allTouches[0].y -
            TOP_MARGIN_PIXEL_OFFSET -
            (zoomLevel.value * 60) / 2
        );
      })
      .onEnd((event, success) => {
        "worklet";

        if (!isDragging.value) {
          return;
        }

        // Make sure it doesn't show the new event component anymore
        createY.value = -1;
        yPosition.value = -1;
        isDragging.value = false;

        if (!success) {
          return;
        }

        // Determine the hour that was clicked and trigger the event creation
        const normalizedY =
          event.y - TOP_MARGIN_PIXEL_OFFSET - (zoomLevel.value * 60) / 2;
        const time = Math.floor(normalizedY / zoomLevel.value);
        const hour = Math.floor(time / 60);
        const minute = time - hour * 60;

        if (onCreateEvent) {
          runOnJS(onCreateEvent)({
            hour,
            minute,
          });
        }
      });

    const combinedGesture = Gesture.Simultaneous(
      pinchGesture,
      longPressGesture,
      doubleTapGesture
    );

    return (
      <GestureDetector gesture={combinedGesture}>
        <Animated.View style={styles.container}>{children}</Animated.View>
      </GestureDetector>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ZoomProvider;
