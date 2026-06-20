import { ConfigProvider } from "../utils/globals";
import { memo, useCallback, useContext, useMemo } from "react";
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

const EventContainerInner = <T extends CalendarEvent>({
  layout,
}: EventContainerProps<T>) => {
  const { onPressEvent, renderEvent } = useContext(ConfigProvider);

  const render = useMemo(
    () =>
      renderEvent(
        layout.event,
        layout.extend ? layout.extend : EventExtend.None
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

const EventContainer = memo(
  EventContainerInner,
  (prev, next) =>
    prev.layout.event.id === next.layout.event.id &&
    prev.layout.event.start === next.layout.event.start &&
    prev.layout.event.end === next.layout.event.end &&
    prev.layout.event.title === next.layout.event.title &&
    prev.layout.event.isAllDay === next.layout.event.isAllDay &&
    prev.layout.extend === next.layout.extend
) as typeof EventContainerInner;

export default EventContainer;

const styles = StyleSheet.create({
  position: {
    height: 28,
  },
});
