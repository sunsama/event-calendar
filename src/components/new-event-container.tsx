import { memo, useContext } from "react";
import { ConfigProvider, TOP_MARGIN_PIXEL_OFFSET } from "src/utils/globals";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { StyleSheet, View } from "react-native";

const NewEventContainer = memo(
  () => {
    const { zoomLevel, createY, theme } = useContext(ConfigProvider);

    const styleVisible = useAnimatedStyle(() => {
      return {
        opacity: createY.value >= 0 ? 0.7 : 0,
        transform: [
          {
            translateY: createY.value - TOP_MARGIN_PIXEL_OFFSET,
          },
        ],
        height: zoomLevel.value * 60,
      };
    }, []);

    // const [time, setTime] = useState("");
    // const momentUse = useRef(moment());

    // const formatTime = useCallback(
    //   (hour: number, minute: number) => {
    //     const date = momentUse.current
    //       .startOf("day")
    //       .add(hour, "hours")
    //       .add(minute, "minutes");
    //
    //     setTime(date.format(timeFormat));
    //   },
    //   [timeFormat]
    // );

    // useAnimatedReaction(
    //   () => ({ zoomLevel: zoomLevel.value, createY: createY.value }),
    //   (state) => {
    //     const time = Math.floor(state.createY / state.zoomLevel);
    //     const hour = Math.floor(time / 60);
    //     const minute = time - hour * 60;
    //
    //     runOnJS(formatTime)(hour, minute);
    //   },
    //   []
    // );

    return (
      <Animated.View style={[styles.container, styleVisible]}>
        <View style={[styles.innerContainer, theme?.newEventContainer]} />
      </Animated.View>
    );
  },
  () => true
);

export default NewEventContainer;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 51,
    right: 0,
    height: 50,
  },
  innerContainer: {
    flex: 1,
    borderRadius: 3,
    padding: 5,
    backgroundColor: "pink",
  },
});
