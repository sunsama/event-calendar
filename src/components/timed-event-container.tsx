import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { ConfigProvider } from "src/utils/globals";
import { RefObject, useCallback, useContext, useMemo } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { EventExtend } from "src/enums";
import { StyleSheet, View } from "react-native";
import { useIsEditing } from "src/hooks/use-is-editing";
import gesturePan from "src/utils/pan-edit-event-gesture";
import doubleTapGesture from "src/utils/double-tap-reset-zoom-gesture";

type TimedEventContainerProps = {
  layout: PartDayEventLayoutType;
  refNewEvent: RefObject<any>;
};

const TimedEventContainer = ({
  layout,
  refNewEvent,
}: TimedEventContainerProps) => {
  const { currentY, setIsEditing, isEditing } = useIsEditing();
  const {
    onPressEvent,
    maximumHour,
    fiveMinuteInterval,
    zoomLevel,
    renderEvent,
    initialZoomLevel,
    onZoomChange,
  } = useContext(ConfigProvider);

  const height = useSharedValue(0);
  const top = useSharedValue(0);

  const startEditing = useCallback(() => {
    setIsEditing(layout);
  }, [layout, setIsEditing]);

  const gestureTap = Gesture.Tap()
    .enabled(!isEditing)
    .onStart(() => {
      if (onPressEvent) {
        runOnJS(onPressEvent)(layout.event);
      }
    });

  const startY = useSharedValue(0);

  const gestures = Gesture.Exclusive(
    doubleTapGesture(zoomLevel, initialZoomLevel, onZoomChange),
    gestureTap,
    gesturePan(
      startY,
      top,
      currentY,
      zoomLevel,
      maximumHour,
      height,
      refNewEvent,
      fiveMinuteInterval,
      isEditing,
      startEditing
    ).activateAfterLongPress(500)
  );

  useAnimatedReaction(
    () => zoomLevel.value,
    (newZoomLevel) => {
      height.value = newZoomLevel * layout.position.height;
    },
    [layout.position.height]
  );

  useAnimatedReaction(
    () => zoomLevel.value,
    (newZoomLevel) => {
      top.value = newZoomLevel * layout.position.top;
    },
    [layout.position.top]
  );

  const render = useMemo(
    () => renderEvent(layout.event, EventExtend.None, height),
    [height, layout.event, renderEvent]
  );

  const stylePosition = useAnimatedStyle(() => {
    const basePosition: any = {
      position: "absolute",
      height: height.value,
      top: top.value,
      opacity: 1,
      width: layout.position.width,
      marginLeft: layout.position.marginLeft,

      // This is to prevent the event from being clickable while editing
      pointerEvents: isEditing ? "none" : "auto",
    };

    if (isEditing?.event.id === layout.event.id) {
      basePosition.opacity = 0.5;
    }

    return basePosition;
  }, [layout, isEditing]);

  return (
    <GestureDetector gesture={gestures}>
      <Animated.View style={stylePosition}>
        <View style={styles.hairline}>{render}</View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  hairline: { marginHorizontal: StyleSheet.hairlineWidth, flex: 1 },
});

export default TimedEventContainer;
