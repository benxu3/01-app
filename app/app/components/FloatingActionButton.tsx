/**
import React from "react"
import { ViewStyle, Pressable, TextStyle } from "react-native"
import Animated, {
  withDelay,
  useAnimatedStyle,
  withSpring,
  withTiming,
  SharedValue,
} from "react-native-reanimated"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

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
*/

import React from "react"
import { ViewStyle, Pressable, TextStyle, View, TouchableOpacity } from "react-native"
import Animated, {
  withDelay,
  useAnimatedStyle,
  withSpring,
  withTiming,
  SharedValue,
} from "react-native-reanimated"
import AntDesign from "@expo/vector-icons/AntDesign"
import { spacing } from "app/theme"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const SPRING_CONFIG = {
  duration: 1200,
  overshootClamping: true,
  dampingRatio: 0.8,
}

const OFFSET = 60

interface FloatingActionButtonProps {
  isExpanded: SharedValue<boolean>
  index?: number
  buttonLetter?: string
  isPrimary?: boolean
  onPress?: () => void
  isDarkMode: boolean
}

export const FloatingActionButton = ({
  isExpanded,
  index = 0,
  buttonLetter,
  isPrimary = false,
  onPress,
  isDarkMode,
}: FloatingActionButtonProps) => {
  const animatedStyles = useAnimatedStyle(() => {
    if (isPrimary) {
      return {
        transform: [{ scale: withSpring(isExpanded.value ? 0.9 : 1, SPRING_CONFIG) }],
      }
    }

    const moveValue = isExpanded.value ? OFFSET * index : 0
    const translateValue = withSpring(-moveValue, SPRING_CONFIG)
    const delay = index * 100
    const scaleValue = isExpanded.value ? 1 : 0
    const opacityValue = isExpanded.value ? 1 : 0

    return {
      transform: [
        { translateY: translateValue },
        { scale: withDelay(delay, withTiming(scaleValue)) },
      ],
      opacity: withDelay(delay, withTiming(opacityValue)),
      zIndex: isExpanded.value ? 2 : 0,
    }
  })

  if (isPrimary) {
    return (
      <TouchableOpacity style={$plusButton} onPress={onPress}>
        <View style={$plusIconContainer(isDarkMode)}>
          <AntDesign name="plus" size={20} color="white" />
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <AnimatedPressable style={[animatedStyles, $button]}>
      <Animated.Text style={$content}>{buttonLetter}</Animated.Text>
    </AnimatedPressable>
  )
}

const $plusIconContainer = (isDarkMode: boolean): ViewStyle => ({
  width: 34,
  height: 34,
  borderRadius: 17,
  backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)",
  justifyContent: "center",
  alignItems: "center",
})

const $plusButton: ViewStyle = {
  width: 34,
  height: 34,
  backgroundColor: "#626262",
  borderRadius: 17,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "row",
  margin: spacing.xxs,
  marginRight: spacing.md,
}

const $button: ViewStyle = {
  width: 34,
  height: 34,
  backgroundColor: "#626262",
  position: "absolute",
  borderRadius: 17,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "row",
}

const $content: TextStyle = {
  color: "#f8f9ff",
  fontWeight: "500", // Changed from 500 to "500" to fix type error
}
