import React from "react"
import { ViewStyle, Pressable, TextStyle } from "react-native"
import Animated, {
  withDelay,
  useAnimatedStyle,
  withSpring,
  withTiming,
  SharedValue,
} from "react-native-reanimated"

export const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const SPRING_CONFIG = {
  duration: 1200,
  overshootClamping: true,
  dampingRatio: 0.8,
}

const OFFSET = 60

interface FloatingActionButtonProps {
  isExpanded: SharedValue<boolean>
  index: number
  buttonLetter: string
}
export const FloatingActionButton = ({
  isExpanded,
  index,
  buttonLetter,
}: FloatingActionButtonProps) => {
  const animatedStyles = useAnimatedStyle(() => {
    const moveValue = isExpanded.value ? OFFSET * index : 0
    const translateValue = withSpring(-moveValue, SPRING_CONFIG)
    const delay = index * 100

    const scaleValue = isExpanded.value ? 1 : 0

    return {
      transform: [
        { translateY: translateValue },
        {
          scale: withDelay(delay, withTiming(scaleValue)),
        },
      ],
    }
  })

  return (
    <AnimatedPressable style={[animatedStyles, $shadow, $button]}>
      <Animated.Text style={$content}>{buttonLetter}</Animated.Text>
    </AnimatedPressable>
  )
}

const $button: ViewStyle = {
  width: 40,
  height: 40,
  backgroundColor: "#626262",
  position: "absolute",
  borderRadius: 100,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "row",
  zIndex: 1000,
  elevation: 5,
}

const $shadow: ViewStyle = {
  shadowColor: "#171717",
  shadowOffset: { width: -0.5, height: 3.5 },
  shadowOpacity: 0.2,
  shadowRadius: 3,
}

const $content: TextStyle = {
  color: "#f8f9ff",
  fontWeight: "500", // Changed from 500 to "500" to fix type error
}
