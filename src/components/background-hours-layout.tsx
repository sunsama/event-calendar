import { memo, type RefObject, useContext } from "react";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { StyleSheet, Text, View } from "react-native";
import { ConfigProvider, TOP_MARGIN_PIXEL_OFFSET } from "../utils/globals";
import { PrefabHour } from "../types";
import { GestureDetector } from "react-native-gesture-handler";
import useLongPressNewEvent from "../hooks/use-long-press-new-event";

type BackgroundHoursLayoutProps = {
  hours: PrefabHour[];
  refNewEvent: RefObject<any>;
};

const BackgroundHoursLayout = memo(
  ({ refNewEvent, hours }: BackgroundHoursLayoutProps) => {
    const { theme, zoomLevel } = useContext(ConfigProvider);

    const styleHourSize = useAnimatedStyle(() => {
      return { height: zoomLevel.value * 60 };
    }, []);

    const longPressNewEvent = useLongPressNewEvent(refNewEvent);

    return (
      <GestureDetector gesture={longPressNewEvent}>
        <View style={[styles.hourContainer, theme?.backgroundHoursContainer]}>
          {hours.map((hour) => (
            <Animated.View
              style={[
                styles.hourInnerContainer,
                theme?.backgroundHoursInnerContainer,
                styleHourSize,
              ]}
              key={hour.increment}
            >
              <Text style={[styles.hourText, theme?.backgroundHoursText]}>
                {hour.hourFormatted}
              </Text>
            </Animated.View>
          ))}
        </View>
      </GestureDetector>
    );
  },
  () => true
);

const styles = StyleSheet.create({
  hourContainer: {
    flexDirection: "column",
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 50,
    paddingRight: 6,
  },
  hourInnerContainer: {
    marginTop: -12,
    paddingTop: TOP_MARGIN_PIXEL_OFFSET,
    marginBottom: 12,
    marginRight: 0,
  },
  hourText: {
    textAlign: "right",
    color: "black",
    fontSize: 10,
  },
});

export default BackgroundHoursLayout;
