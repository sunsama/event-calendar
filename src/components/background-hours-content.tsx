import { memo, type RefObject, useContext } from "react";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
} from "react-native-reanimated";
import { StyleSheet } from "react-native";
import { ConfigProvider } from "../utils/globals";
import { PrefabHour } from "../types";
import useLongPressNewEvent from "../hooks/use-long-press-new-event";
import { GestureDetector } from "react-native-gesture-handler";
import useAutoScroll from "../hooks/use-auto-scroll";

type BackgroundHoursContentProps = {
  hours: PrefabHour[];
  refNewEvent: RefObject<any>;
};

const BackgroundHoursContent = memo(
  ({ refNewEvent, hours }: BackgroundHoursContentProps) => {
    const {
      theme,
      zoomLevel,
      createY,
      maximumHour,
      scrollY,
      scrollRef,
      scrollViewHeight,
    } = useContext(ConfigProvider);

    const styleHourSize = useAnimatedStyle(() => {
      return { height: zoomLevel.value * 60 };
    }, []);

    const { gesture: longPressNewEvent, isDragging } =
      useLongPressNewEvent(refNewEvent);

    const bottomEdgeY = useDerivedValue(
      () => createY.value + zoomLevel.value * 60
    );

    useAutoScroll({
      scrollRef,
      scrollY,
      scrollViewHeight,
      maximumHour,
      topEdgeY: createY,
      bottomEdgeY,
      isActive: isDragging,
      positionY: createY,
    });

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
