import { memo, type RefObject, useContext } from "react";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { StyleSheet } from "react-native";
import { ConfigProvider } from "../utils/globals";
import { PrefabHour } from "../types";
import useLongPressNewEvent from "src/hooks/use-long-press-new-event";
import { GestureDetector } from "react-native-gesture-handler";

type BackgroundHoursContentProps = {
  hours: PrefabHour[];
  refNewEvent: RefObject<any>;
};

const BackgroundHoursContent = memo(
  ({ refNewEvent, hours }: BackgroundHoursContentProps) => {
    const { theme, zoomLevel } = useContext(ConfigProvider);

    const styleHourSize = useAnimatedStyle(() => {
      return { height: zoomLevel.value * 60 };
    }, []);

    const longPressNewEvent = useLongPressNewEvent(refNewEvent);

    return (
      <GestureDetector gesture={longPressNewEvent}>
        <Animated.View>
          {hours.map((hour) => (
            <Animated.View
              style={[
                styles.hourContainer,
                hour === hours[hours.length - 1]
                  ? styles.bottomBorder
                  : undefined,
                theme?.backgroundHoursLayoutContainer,
                styleHourSize,
              ]}
              key={hour.increment}
            />
          ))}
        </Animated.View>
      </GestureDetector>
    );
  },
  () => true
);

const styles = StyleSheet.create({
  hourContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginRight: -20,
    borderColor: "black",
  },
  bottomBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

export default BackgroundHoursContent;
