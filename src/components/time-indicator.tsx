import { memo, useCallback, useContext, useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { ConfigProvider } from "../utils/globals";
import moment from "moment-timezone";
import { AppState, StyleSheet } from "react-native";

const TimeIndicator = memo(
  () => {
    const { zoomLevel, timezone, theme } = useContext(ConfigProvider);

    const currentMinutes = useCallback(() => {
      const time = moment.tz(timezone);

      return time.minutes() + time.hours() * 60;
    }, [timezone]);

    const currentMoment = useSharedValue<number>(currentMinutes());

    useEffect(() => {
      let interval = setInterval(() => {
        currentMoment.value = currentMinutes();
      }, 20000);

      const subscription = AppState.addEventListener(
        "change",
        (appState: string) => {
          clearInterval(interval);

          if (appState === "active") {
            interval = setInterval(() => {
              currentMoment.value = currentMinutes();
            }, 20000);
          }
        }
      );

      return () => {
        clearInterval(interval);
        subscription.remove();
      };
    }, [currentMinutes, currentMoment]);

    const style = useAnimatedStyle(() => ({
      top: zoomLevel.value * currentMoment.value,
    }));

    return (
      <Animated.View
        style={[styles.timeIndicator, style, theme?.timeIndicator]}
      />
    );
  },
  () => true
);

export default TimeIndicator;

const styles = StyleSheet.create({
  timeIndicator: {
    position: "absolute",
    left: 0,
    width: "110%",
    borderTopWidth: 2,
    borderTopColor: "#f25a43",
    zIndex: 2,
    elevation: 2,
    opacity: 0.6,
  },
});
