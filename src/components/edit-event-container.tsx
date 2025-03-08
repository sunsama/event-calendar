import {
  memo,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useIsEditing } from "../hooks/use-is-editing";
import { ConfigProvider } from "../utils/globals";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { EventExtend } from "../types";
import gesturePan from "../utils/pan-edit-event-gesture";
import DragBar from "../components/drag-bar";
import { StyleSheet } from "react-native";
import moment from "moment-timezone";

type EditEventContainerProps = {
  refNewEvent: RefObject<any>;
};

const EditEventContainer = memo(
  ({ refNewEvent }: EditEventContainerProps) => {
    const { currentY, isEditing: editingEvent, setIsEditing } = useIsEditing();
    const {
      maximumHour,
      fiveMinuteInterval,
      renderDragBars,
      zoomLevel,
      renderEvent,
      timezone,
      dayDate,
    } = useContext(ConfigProvider);
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
      if (!editingEvent) {
        return { opacity: 0 };
      }

      return {
        marginLeft: StyleSheet.hairlineWidth,
        position: "absolute",
        height: height.value,
        top: currentY.value,
        opacity: 1,
        width: "100%",
      };
    }, [editingEvent]);

    const startY = useSharedValue(0);

    const updatedStart = useDerivedValue(() => {
      return currentY.value / zoomLevel.value;
    }, []);

    const updatedEnd = useDerivedValue(() => {
      return (currentY.value + height.value) / zoomLevel.value;
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
          ).withRef(refMainContainer)
        )}
      >
        <Animated.View style={styleAnimatedPosition}>
          {renderEvent(editingEvent.event, EventExtend.None, height, {
            updatedEnd,
            updatedStart,
          })}
          {renderDragBars?.top ? (
            <DragBar
              event={editingEvent.event}
              top={currentY}
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
