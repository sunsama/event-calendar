import { Gesture } from "react-native-gesture-handler";
import { runOnJS, SharedValue } from "react-native-reanimated";
import { RefObject } from "react";
import { type CalendarEvent, PartDayEventLayoutType } from "../types";

const gesturePan = <T extends CalendarEvent>(
  startY: SharedValue<number>,
  top: SharedValue<number>,
  currentY: SharedValue<number>,
  zoomLevel: SharedValue<number>,
  maximumHour: SharedValue<number>,
  height: SharedValue<number>,
  refNewEvent: RefObject<any>,
  fiveMinuteInterval?: boolean,
  isEditing?: null | PartDayEventLayoutType<T>,
  startEditing?: () => void,
  isDragging?: SharedValue<boolean>,
  autoScrollOffset?: SharedValue<number>
) =>
  Gesture.Pan()
    .blocksExternalGesture(refNewEvent)
    .onStart(() => {
      if (startEditing) {
        if (isEditing) {
          return;
        }

        if (!isEditing) {
          runOnJS(startEditing)();
        }
      }

      startY.value = top.value;
      if (isDragging) isDragging.value = true;
      if (autoScrollOffset) autoScrollOffset.value = 0;
    })
    .onUpdate(({ translationY }) => {
      const effectiveTranslation =
        translationY + (autoScrollOffset ? autoScrollOffset.value : 0);
      let freshUpdatedStartTime;

      if (fiveMinuteInterval) {
        // Set the updated time in 5 minute increments but make sure we never go lower
        // than the first minute of the day
        freshUpdatedStartTime = Math.max(
          0,
          startY.value +
            Math.floor(effectiveTranslation / zoomLevel.value / 5) *
              (zoomLevel.value * 5)
        );
      } else {
        // Set the updated time in 1 minute increments but make sure we never go lower
        // than the first minute of the day
        freshUpdatedStartTime = Math.max(
          0,
          startY.value +
            Math.floor(effectiveTranslation / zoomLevel.value) * zoomLevel.value
        );
      }

      // Make sure the event does not span after midnight, and if so make sure it
      // is limited to exactly midnight
      if (freshUpdatedStartTime > maximumHour.value - height.value) {
        freshUpdatedStartTime = maximumHour.value - height.value;
      }

      currentY.value = freshUpdatedStartTime;
    })
    .onFinalize(() => {
      if (isDragging) isDragging.value = false;
    });

export default gesturePan;
