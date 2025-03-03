import { ConfigProvider } from "../utils/globals";
import { useCallback, useContext, useMemo } from "react";
import { Pressable } from "react-native-gesture-handler";
import { View } from "react-native";
import {
  AllDayEventLayoutType,
  type CalendarEvent,
  EventExtend,
} from "../types";

type EventContainerProps<T extends CalendarEvent> = {
  layout: AllDayEventLayoutType<T>;
};

const EventContainer = <T extends CalendarEvent>({
  layout,
}: EventContainerProps<T>) => {
  const { onPressEvent, renderEvent, initialZoomLevel } =
    useContext(ConfigProvider);

  const render = useMemo(
    () =>
      renderEvent(
        layout.event,
        (layout as AllDayEventLayoutType<T>).extend
          ? (layout as AllDayEventLayoutType<T>).extend
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
