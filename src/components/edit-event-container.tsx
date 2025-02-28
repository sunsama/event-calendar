import { memo, RefObject, useContext, useEffect } from "react";
import { useIsEditing } from "src/hooks/use-is-editing";
import { ConfigProvider } from "src/utils/globals";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { EventExtend } from "src/enums";
import gesturePan from "src/utils/pan-edit-event-gesture";

type EditEventContainerProps = {
  refNewEvent: RefObject<any>;
};

const EditEventContainer = memo(
  ({ refNewEvent }: EditEventContainerProps) => {
    const { currentY, isEditing: editingEvent, setIsEditing } = useIsEditing();
    const { fiveMinuteInterval, zoomLevel, renderEvent } =
      useContext(ConfigProvider);
    const height = useSharedValue(0);

    useEffect(() => {
      if (editingEvent) {
        height.value = editingEvent.position.height * zoomLevel.value;
        currentY.value = editingEvent.position.top * zoomLevel.value;
      }
    }, [height, editingEvent, currentY, zoomLevel]);

    useAnimatedReaction(
      () => zoomLevel.value,
      (zoom) => {
        if (editingEvent) {
          height.value = editingEvent.position.height * zoom;
          currentY.value = editingEvent.position.top * zoom;
        }
      },
      [height, currentY, zoomLevel, editingEvent]
    );

    const styleAnimatedPosition = useAnimatedStyle(() => {
      // The element isn't even there
      if (!editingEvent) {
        return { opacity: 0 };
      }

      return {
        position: "absolute",
        height: height.value,
        top: currentY.value,
        opacity: 1,
        width: "100%",
      };
    }, [editingEvent]);

    const startY = useSharedValue(0);
    const maximumHour = useDerivedValue(() => {
      return 1440 * zoomLevel.value;
    }, [zoomLevel]);

    const gestureTap = Gesture.Tap()
      .numberOfTaps(1)
      .onStart(() => {
        runOnJS(setIsEditing)(null);
      });

    if (!editingEvent) {
      return null;
    }

    return (
      <GestureDetector
        gesture={Gesture.Simultaneous(
          gestureTap,
          gesturePan(
            startY,
            currentY,
            currentY,
            zoomLevel,
            maximumHour,
            height,
            refNewEvent,
            fiveMinuteInterval
          )
        )}
      >
        <Animated.View style={styleAnimatedPosition}>
          {renderEvent(editingEvent.event, EventExtend.None, height)}
        </Animated.View>
      </GestureDetector>
    );
  },
  () => true
);

export default EditEventContainer;
