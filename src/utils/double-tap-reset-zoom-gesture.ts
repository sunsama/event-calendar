import { Gesture } from "react-native-gesture-handler";
import { SharedValue } from "react-native-reanimated";

const doubleTapGesture = (
  zoomLevel: SharedValue<number>,
  initialZoomLevel: number
) =>
  Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((_event, success) => {
      if (success) {
        // Reset the zoom level to the default
        zoomLevel.value = initialZoomLevel;
      }
    });

export default doubleTapGesture;
