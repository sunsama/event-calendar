import { Gesture } from "react-native-gesture-handler";
import { runOnJS, SharedValue } from "react-native-reanimated";
import { type CalendarEvent, Config } from "../types";

const doubleTapGesture = <T extends CalendarEvent>(
  zoomLevel: SharedValue<number>,
  initialZoomLevel: number,
  onZoomChange?: Config<T>["onZoomChange"]
) =>
  Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((_event, success) => {
      if (success) {
        // Reset the zoom level to the default
        zoomLevel.value = initialZoomLevel;

        if (onZoomChange) {
          runOnJS(onZoomChange)(initialZoomLevel);
        }
      }
    });

export default doubleTapGesture;
