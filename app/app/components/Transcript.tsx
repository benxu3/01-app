import React from "react"
import { ChatTile } from "./Chat"
import { Dimensions, View, ViewStyle } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useTheme } from "../utils/useTheme"
import { UnifiedMessage } from "../screens/HeroScreen"

export function TranscriptionTile({ messages }: { messages: UnifiedMessage[] }) {
  const { isDarkMode } = useTheme()

  return (
    <View style={$transcriptionContainer}>
      <LinearGradient
        colors={
          isDarkMode
            ? ["rgba(0,0,0,1)", "rgba(0,0,0,0.8)", "rgba(0,0,0,0)"]
            : ["rgba(256,256,256,1)", "rgba(256,256,256,0.8)", "rgba(256,256,256,0)"]
        }
        style={$gradientTop}
      />
      <ChatTile messages={messages} />
      <LinearGradient
        colors={
          isDarkMode
            ? ["rgba(0,0,0,0)", "rgba(0,0,0,0.8)", "rgba(0,0,0,1)"]
            : ["rgba(256,256,256,0)", "rgba(256,256,256,0.8)", "rgba(256,256,256,1)"]
        }
        style={$gradientBottom}
      />
    </View>
  )
}

const $transcriptionContainer: ViewStyle = {
  height: Dimensions.get("window").height * 0.77,
  flex: 1,
}

const $gradientTop: ViewStyle = {
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  height: 27 * 1.2 * 2.8,
  zIndex: 1000,
}

const $gradientBottom: ViewStyle = {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  height: 27 * 1.2 * 2.8,
  zIndex: 1000,
}
