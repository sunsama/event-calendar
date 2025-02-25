import { memo, useContext } from "react";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { StyleSheet, Text, View } from "react-native";
import { ConfigProvider } from "src/utils/globals";

type BackgroundHoursLayoutProps = {
  hours: PrefabHour[];
};

const BackgroundHoursLayout = memo(
  ({ hours }: BackgroundHoursLayoutProps) => {
    const { theme, zoomLevel } = useContext(ConfigProvider);

    const styleHourSize = useAnimatedStyle(() => {
      return { height: zoomLevel.value * 60 };
    }, []);

    return (
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
    marginBottom: 12,
    marginRight: 0,
    borderTopColor: "transparent",
  },
  hourText: {
    textTransform: "uppercase",
    textAlign: "right",
    color: "black",
    fontSize: 10,
  },
});

export default BackgroundHoursLayout;
