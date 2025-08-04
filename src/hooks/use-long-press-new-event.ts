import { Gesture } from "react-native-gesture-handler";
import { ConfigProvider, TOP_MARGIN_PIXEL_OFFSET } from "src/utils/globals";
import { runOnJS, useSharedValue } from "react-native-reanimated";
import { useIsEditing } from "src/hooks/use-is-editing";
import { type RefObject, useContext } from "react";

export default function useLongPressNewEvent(refNewEvent: RefObject<any>) {
  const {
    canCreateEvents,
    zoomLevel,
    createY,
    onCreateEvent,
    fiveMinuteInterval,
  } = useContext(ConfigProvider);
  const yPosition = useSharedValue(-1);
  const { isEditing } = useIsEditing();
  const isDragging = useSharedValue(false);

  return Gesture.LongPress()
    .enabled(canCreateEvents && !isEditing)
    .withRef(refNewEvent as any)
    .numberOfPointers(1)
    .minDuration(250)
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

      if (!fiveMinuteInterval) {
        createY.value = Math.max(
          0,
          event.allTouches[0].y -
            TOP_MARGIN_PIXEL_OFFSET -
            (zoomLevel.value * 60) / 2
        );
      } else {
        const normalizedY =
          event.allTouches[0].y -
          TOP_MARGIN_PIXEL_OFFSET -
          (zoomLevel.value * 60) / 2;
        const time = Math.floor(normalizedY / zoomLevel.value);
        const hour = Math.floor(time / 60);
        const minute = time - hour * 60;
        const minuteInterval = Math.floor(minute / 5) * 5;

        createY.value = (hour * 60 + minuteInterval) * zoomLevel.value;
      }
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

      if (!onCreateEvent) {
        return;
      }

      if (fiveMinuteInterval) {
        const minuteInterval = Math.floor(minute / 5) * 5;

        runOnJS(onCreateEvent)({
          hour,
          minute: minuteInterval,
        });
        return;
      }

      runOnJS(onCreateEvent)({
        hour,
        minute,
      });
    });
}
