import * as React from "react"
import { View, ViewStyle } from "react-native"
import { SharedValue } from "react-native-reanimated"
import { FloatingActionButton } from "./FloatingActionButton"
import { spacing } from "app/theme"

export type FloatingActionMenuProps = {
  expanded: SharedValue<boolean>
  darkMode: boolean
  cameraEnabled?: boolean
  setCameraEnabled: (enabled: boolean) => void
  switchCamera: () => void
  // screenShareEnabled: boolean
  // setScreenShareEnabled: (enabled: boolean) => void
}
export const FloatingActionMenu = ({
  expanded,
  darkMode,
  cameraEnabled = false,
  setCameraEnabled,
  switchCamera,
}: // screenShareEnabled = false,
// setScreenShareEnabled,

FloatingActionMenuProps) => {
  const cameraImage = cameraEnabled
    ? require("../../assets/icons/baseline_videocam_white_24dp.png")
    : require("../../assets/icons/baseline_videocam_off_white_24dp.png")

  const flipCamera = require("../../assets/icons/camera_flip_outline.png")
  /** 
  const screenShareImage = screenShareEnabled
    ? require("../../assets/icons/baseline_cast_connected_white_24dp.png")
    : require("../../assets/icons/baseline_cast_white_24dp.png")
  */
  return (
    <View style={$floatingButtonContainer}>
      <FloatingActionButton
        isExpanded={expanded}
        index={1}
        onPress={() => {
          setCameraEnabled(!cameraEnabled)
        }}
        isDarkMode={darkMode}
        source={cameraImage}
      />

      <FloatingActionButton
        isExpanded={expanded}
        index={2}
        onPress={() => {
          switchCamera()
        }}
        isDarkMode={darkMode}
        source={flipCamera}
      />
    </View>
  )
}

const $floatingButtonContainer: ViewStyle = {
  position: "absolute",
  bottom: spacing.xxl * 1.5 + spacing.md + spacing.xxs,
  left: spacing.md,
}
