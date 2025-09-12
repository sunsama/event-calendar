import { ConfigProvider } from "../utils/globals";
import { useCallback, useContext, useMemo } from "react";
import { Pressable } from "react-native-gesture-handler";
import { StyleSheet, View } from "react-native";
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
  const { onPressEvent, renderEvent } = useContext(ConfigProvider);

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

  const onPress = useCallback(() => {
    onPressEvent && onPressEvent(layout.event);
  }, [layout.event, onPressEvent]);

  return (
    <Pressable onPress={onPress}>
      <View style={styles.position}>{render}</View>
    </Pressable>
  );
};

export default EventContainer;

const styles = StyleSheet.create({
  position: {
    height: 28,
  },
});
