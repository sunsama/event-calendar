import Animated, {
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { ConfigProvider } from "src/utils/globals";
import { useContext, useEffect, useMemo } from "react";
import moment from "moment-timezone";
import useIsEditing from "src/hooks/use-is-editing";
import { useShallow } from "zustand/react/shallow";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

type EventContainerProps = {
  layout: AllDayEventLayoutType | PartDayEventLayoutType;
};

type ComputePositioning = {
  layout: PartDayEventLayoutType | AllDayEventLayoutType;
  startDateMoment: any;
  startOfDayMoment: any;
  durationMinutes: number;
};

const computePositioning = ({
  layout,
  startDateMoment,
  startOfDayMoment,
  durationMinutes,
}: ComputePositioning) => {
  let width = 100;
  let margin = 0;
  let top;
  let height = 24;

  if ((layout as AllDayEventLayoutType).rowIndex || -1 >= 0) {
    // if it's an all day or event, or multi-day spanning event
    top = 0;
    width = ((layout as AllDayEventLayoutType).visibleWidthDays || 1) * 100;
    margin = 0;
  } else {
    top = startDateMoment.diff(startOfDayMoment, "minutes");
    height = Math.max(30, durationMinutes);

    const collisions = (layout as PartDayEventLayoutType).collisions;

    if (collisions) {
      margin = (100 / collisions.total) * collisions.order;
      width =
        collisions.order + 1 < collisions.total
          ? Math.max(100 - 12 * collisions.total, 20)
          : 100 / collisions.total + 3;
    }
  }

  return {
    top,
    height,
    width: `${width}%`,
    marginLeft: `${margin}%`,
  };
};

const useIsEventEditingAnimated = (eventId: string): SharedValue<boolean> => {
  const isEditing = useIsEditing(useShallow((state) => state === eventId));
  const isEditingAnimated = useSharedValue(isEditing);

  useEffect(() => {
    isEditingAnimated.value = isEditing;
  }, [isEditing, isEditingAnimated]);

  return isEditingAnimated;
};

const EventContainer = ({ layout }: EventContainerProps) => {
  const { zoomLevel, timezone, dayDate, renderEvent } =
    useContext(ConfigProvider);

  const [positioning] = useMemo(() => {
    const freshStartDateMoment = moment.tz(layout.event.start, timezone);
    const freshEndDateMoment = moment.tz(layout.event.end, timezone);
    const freshIsPast = freshEndDateMoment.isBefore();
    const durationMinutes = freshEndDateMoment.diff(
      freshStartDateMoment,
      "minutes"
    );

    const freshPositioning = computePositioning({
      layout,
      startDateMoment: freshStartDateMoment,
      startOfDayMoment: dayDate,
      durationMinutes,
    });

    return [
      freshPositioning,
      freshStartDateMoment,
      freshEndDateMoment,
      freshIsPast,
    ];
  }, [dayDate, layout, timezone]);

  const isEditing = useIsEventEditingAnimated(layout.event.id);

  // const [time, setTime] = useState(formatTimeLabel());
  const gestures = useMemo(() => Gesture.Simultaneous(), []);

  const height = useSharedValue(0);

  useAnimatedReaction(
    () => zoomLevel.value,
    (newZoomLevel) => {
      height.value = newZoomLevel * positioning.height;
    },
    [positioning.height]
  );

  const top = useSharedValue(0);

  useAnimatedReaction(
    () => zoomLevel.value,
    (newZoomLevel) => {
      top.value = newZoomLevel * positioning.top;
    },
    [positioning.top]
  );

  const render = useMemo(
    () => renderEvent(layout.event, height, EventExtend.None),
    [height, layout.event, renderEvent]
  );

  const stylePosition = useAnimatedStyle(() => {
    const basePosition: any = {
      position: "absolute",
      height: height.value,
      top: top.value,
    };

    if (isEditing.value) {
      // We want to span the whole width of the container
      basePosition.width = "100%";
      basePosition.marginLeft = 0;
    } else {
      // We want to adhere to the positioning
      basePosition.width = positioning.width;
      basePosition.marginLeft = positioning.marginLeft;
    }

    return basePosition;
  }, [positioning]);

  return (
    <GestureDetector gesture={gestures}>
      <Animated.View style={stylePosition}>{render}</Animated.View>
    </GestureDetector>
  );
};

export default EventContainer;
