import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { ConfigProvider, MIN_EVENT_HEIGHT_PX } from "../utils/globals";
import {
  memo,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { StyleSheet, View } from "react-native";
import { useIsEditing } from "../hooks/use-is-editing";
import gesturePan from "../utils/pan-edit-event-gesture";
import doubleTapGesture from "../utils/double-tap-reset-zoom-gesture";
import {
  type CalendarEvent,
  EventExtend,
  PartDayEventLayoutType,
} from "../types";

type TimedEventContainerProps<T extends CalendarEvent> = {
  layout: PartDayEventLayoutType<T>;
  refNewEvent: RefObject<any>;
};

const TimedEventContainerInner = <T extends CalendarEvent>({
  layout,
  refNewEvent,
}: TimedEventContainerProps<T>) => {
  const { currentY, isDragging, autoScrollOffset, setIsEditing, isEditing } =
    useIsEditing();
  const {
    onPressEvent,
    maximumHour,
    fiveMinuteInterval,
    zoomLevel,
    renderEvent,
    initialZoomLevel,
    onZoomChange,
    initialEventEdit,
  } = useContext(ConfigProvider);

  const height = useSharedValue(0);
  const top = useSharedValue(0);

  const startEditing = useCallback(() => {
    setIsEditing(layout);
  }, [layout, setIsEditing]);

  const onPressOverride = useCallback(() => {
    if (onPressEvent) {
      onPressEvent(layout.event);
    }
  }, [layout, onPressEvent]);

  const gestureTap = Gesture.Tap()
    .enabled(!isEditing)
    .onStart(() => {
      runOnJS(onPressOverride)();
    });

  const startY = useSharedValue(0);

  const initialRender = useRef(true);

  useEffect(() => {
    if (!initialRender.current) {
      return;
    }

    initialRender.current = false;

    if (!initialEventEdit || initialEventEdit !== layout.event.id) {
      return;
    }

    startEditing();
  }, [initialEventEdit, layout.event.id, startEditing]);

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
      startEditing,
      isDragging,
      autoScrollOffset
    ).activateAfterLongPress(500)
  );

  const eventStart = layout.event.start;
  const eventEnd = layout.event.end;
  useAnimatedReaction(
    () => zoomLevel.value,
    (newZoomLevel) => {
      const start = new Date(eventStart);
      const end = new Date(eventEnd);
      const diff = (end.valueOf() - start.valueOf()) / 60_000;

      height.value = Math.max(MIN_EVENT_HEIGHT_PX, newZoomLevel * diff);
    },
    [eventStart, eventEnd]
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

  const eventId = layout.event.id;
  const layoutPosition = layout.position;
  const isEditingEventId = isEditing?.event.id;

  const stylePosition = useAnimatedStyle(() => {
    const basePosition: any = {
      position: "absolute",
      height: height.value,
      top: top.value,
      opacity: 1,
      width: layoutPosition.width,
      marginLeft: layoutPosition.marginLeft,

      // This is to prevent the event from being clickable while editing
      pointerEvents: isEditingEventId ? "none" : "auto",
    };

    if (isEditingEventId === eventId) {
      basePosition.opacity = 0.5;
    }

    return basePosition;
  }, [layoutPosition, isEditingEventId, eventId]);

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

const arePropsEqual = <T extends CalendarEvent>(
  prev: TimedEventContainerProps<T>,
  next: TimedEventContainerProps<T>
) => {
  if (prev.refNewEvent !== next.refNewEvent) return false;

  const pl = prev.layout;
  const nl = next.layout;

  return (
    pl.event.id === nl.event.id &&
    pl.event.start === nl.event.start &&
    pl.event.end === nl.event.end &&
    pl.event.title === nl.event.title &&
    pl.event.calendarId === nl.event.calendarId &&
    pl.event.isAllDay === nl.event.isAllDay &&
    pl.position.top === nl.position.top &&
    pl.position.height === nl.position.height &&
    pl.position.width === nl.position.width &&
    pl.position.marginLeft === nl.position.marginLeft &&
    pl.collisions?.total === nl.collisions?.total &&
    pl.collisions?.order === nl.collisions?.order
  );
};

const TimedEventContainer = memo(TimedEventContainerInner, arePropsEqual) as <
  T extends CalendarEvent,
>(
  props: TimedEventContainerProps<T>
) => React.JSX.Element;

export default TimedEventContainer;
