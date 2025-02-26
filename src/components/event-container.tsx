import { ConfigProvider } from "src/utils/globals";
import { useCallback, useContext, useMemo } from "react";
import { Pressable } from "react-native-gesture-handler";
import { EventExtend } from "src/enums";
import { View } from "react-native";

type EventContainerProps = {
  layout: AllDayEventLayoutType;
};

const EventContainer = ({ layout }: EventContainerProps) => {
  const { onPressEvent, renderEvent, initialZoomLevel } =
    useContext(ConfigProvider);

  // const isEditing = useIsEventEditingAnimated(layout.event.id);

  // const [time, setTime] = useState(formatTimeLabel());

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

  const onPress = useCallback(() => {
    onPressEvent && onPressEvent(layout.event);
  }, [layout.event, onPressEvent]);

  return (
    <Pressable onPress={onPress}>
      <View style={stylePosition}>{render}</View>
    </Pressable>
  );
};

export default EventContainer;
