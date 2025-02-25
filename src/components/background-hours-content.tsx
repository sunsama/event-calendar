import { memo, useContext } from "react";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { StyleSheet } from "react-native";
import { ConfigProvider } from "src/utils/globals";

type BackgroundHoursContentProps = {
  hours: PrefabHour[];
};

const BackgroundHoursContent = memo(
  ({ hours }: BackgroundHoursContentProps) => {
    const { theme, zoomLevel } = useContext(ConfigProvider);

    const styleHourSize = useAnimatedStyle(() => {
      return { height: zoomLevel.value * 60 };
    }, []);

    return (
      <>
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
      </>
    );
  },
  () => true
);

const styles = StyleSheet.create({
  hourContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: StyleSheet.hairlineWidth,
    marginRight: -20,
    borderColor: "black",
  },
  bottomBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

export default BackgroundHoursContent;
