import {
  memo,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useIsEditing } from "../hooks/use-is-editing";
import { ConfigProvider, MIN_EVENT_HEIGHT_PX } from "../utils/globals";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  measure,
  runOnJS,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { type CalendarEvent, EventExtend } from "../types";
import gesturePan from "../utils/pan-edit-event-gesture";
import DragBar from "../components/drag-bar";
import { StyleSheet } from "react-native";
import moment from "moment-timezone";

type EditEventContainerProps = {
  refNewEvent: RefObject<any>;
};

const EditEventContainer = memo(
  ({ refNewEvent }: EditEventContainerProps) => {
    const { isEditing: editingEvent, setIsEditing } = useIsEditing();
    const {
      maximumHour,
      fiveMinuteInterval,
      renderDragBars,
      zoomLevel,
      renderEvent,
      timezone,
      dayDate,
      createY,
      editingContainerHeight,
    } = useContext(ConfigProvider);
    const height = useSharedValue(0);

    const calculateHeight = useCallback(
      (event: CalendarEvent, zoom: number) => {
        const start = new Date(event.start);
        const end = new Date(event.end);

        // We can't use the position.height as that has a minimum time of 30 minutes, which might not be relevant to
        // our actual duration, meaning we'll have to calculate the height based on the start and end times
        height.value = ((end.valueOf() - start.valueOf()) / 60_000) * zoom;
      },
      [height]
    );

    useEffect(() => {
      if (!editingEvent) {
        return;
      }

      calculateHeight(editingEvent.event, zoomLevel.value);
      createY.value = editingEvent.position.top * zoomLevel.value;
    }, [height, editingEvent, createY, zoomLevel, timezone, calculateHeight]);

    useAnimatedReaction(
      () => zoomLevel.value,
      (zoom) => {
        if (editingEvent) {
          runOnJS(calculateHeight)(editingEvent.event, zoom);
          createY.value = editingEvent.position.top * zoom;
        }
      },
      [height, createY, zoomLevel, editingEvent]
    );

    const styleAnimatedPosition = useAnimatedStyle(() => {
      if (!editingEvent) {
        return { opacity: 0 };
      }

      return {
        marginLeft: StyleSheet.hairlineWidth,
        position: "absolute",
        height: Math.max(MIN_EVENT_HEIGHT_PX, height.value),
        top: createY.value,
        opacity: 1,
        width: "100%",
      };
    }, [editingEvent]);

    const startY = useSharedValue(0);

    const updatedStart = useDerivedValue(() => {
      return createY.value / zoomLevel.value;
    }, []);

    const updatedEnd = useDerivedValue(() => {
      return (createY.value + height.value) / zoomLevel.value;
    }, []);

    const endEventEditing = useCallback(
      (newStart: number, newEnd: number) => {
        // Format the new start and end times
        setIsEditing(null, {
          updatedStart: moment.tz(dayDate, timezone).minutes(newStart).format(),
          updatedEnd: moment.tz(dayDate, timezone).minutes(newEnd).format(),
        });
      },
      [dayDate, setIsEditing, timezone]
    );

    const gestureTap = Gesture.Tap()
      .numberOfTaps(1)
      .onStart(() => {
        runOnJS(endEventEditing)(updatedStart.value, updatedEnd.value);
      });

    const refMainContainer = useRef();

    const refView = useAnimatedRef();

    useAnimatedReaction(
      () => createY.value > 0 && editingEvent,
      (isEditing, _previous) => {
        if (isEditing) {
          //} && isEditing !== previous) {
          const measured = measure(refView);
          console.info("---- measured", measured);
          editingContainerHeight.value = measured?.height || 0;
        }
      },
      [editingEvent, editingContainerHeight]
    );

    if (!editingEvent) {
      return null;
    }

    return (
      <GestureDetector
        gesture={Gesture.Simultaneous(
          gestureTap,
          gesturePan(
            startY,
            createY,
            createY,
            zoomLevel,
            maximumHour,
            height,
            refNewEvent,
            fiveMinuteInterval
          ).withRef(refMainContainer)
        )}
      >
        <Animated.View ref={refView} style={styleAnimatedPosition}>
          {renderEvent(editingEvent.event, EventExtend.None, height, {
            updatedEnd,
            updatedStart,
          })}
          {renderDragBars?.top ? (
            <DragBar
              event={editingEvent.event}
              top={createY}
              height={height}
              render={renderDragBars.top}
              refMainContainer={refMainContainer}
              zoomLevel={zoomLevel}
              maximumHour={maximumHour}
              fiveMinuteInterval={fiveMinuteInterval}
            />
          ) : null}
          {renderDragBars?.bottom ? (
            <DragBar
              event={editingEvent.event}
              height={height}
              render={renderDragBars.bottom}
              refMainContainer={refMainContainer}
              zoomLevel={zoomLevel}
              maximumHour={maximumHour}
              fiveMinuteInterval={fiveMinuteInterval}
            />
          ) : null}
        </Animated.View>
      </GestureDetector>
    );
  },
  () => true
);

export default EditEventContainer;
