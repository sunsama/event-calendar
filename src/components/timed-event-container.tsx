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
import { EventExtend } from "src/enums";
import { StyleSheet, View } from "react-native";

type TimedEventContainerProps = {
  layout: PartDayEventLayoutType;
};

type ComputePositioning = {
  layout: PartDayEventLayoutType;
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

  const top = startDateMoment.diff(startOfDayMoment, "minutes");
  const height = Math.max(30, durationMinutes);
  const collisions = layout.collisions;

  if (collisions) {
    margin = (100 / collisions.total) * collisions.order;
    width =
      collisions.order + 1 < collisions.total
        ? Math.max(100 - 12 * collisions.total, 20)
        : 100 / collisions.total;
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

const TimedEventContainer = ({ layout }: TimedEventContainerProps) => {
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
    () => renderEvent(layout.event, EventExtend.None, height),
    [height, layout, renderEvent]
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
