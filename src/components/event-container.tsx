import { ConfigProvider } from "src/utils/globals";
import { useContext, useMemo } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { EventExtend } from "src/enums";
import { View } from "react-native";

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

  const stylePosition = useMemo(
    () => ({
      height: Math.max(28, 24 * initialZoomLevel),
    }),
    [initialZoomLevel]
  );

  return (
    <GestureDetector gesture={gestures}>
      <View style={stylePosition}>{render}</View>
    </GestureDetector>
  );
};

export default EventContainer;
