import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { ConfigProvider } from "src/utils/globals";
import { useContext, useMemo } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { EventExtend } from "src/enums";

type EventContainerProps = {
  layout: AllDayEventLayoutType;
};

const EventContainer = ({ layout }: EventContainerProps) => {
  const { renderEvent, initialZoomLevel } = useContext(ConfigProvider);

  // const isEditing = useIsEventEditingAnimated(layout.event.id);

  // const [time, setTime] = useState(formatTimeLabel());
  const gestures = useMemo(() => Gesture.Simultaneous(), []);

  const render = useMemo(
    () =>
      renderEvent(
        layout.event,
        (layout as AllDayEventLayoutType).extend
          ? (layout as AllDayEventLayoutType).extend
          : EventExtend.None
      ),
    [layout, renderEvent]
  );

  const stylePosition = useAnimatedStyle(() => {
    const basePosition: any = {
      height: Math.max(28, 24 * initialZoomLevel),
    };

    return basePosition;
  }, []);

  return (
    <GestureDetector gesture={gestures}>
      <Animated.View style={stylePosition}>{render}</Animated.View>
    </GestureDetector>
  );
};

export default EventContainer;
