import * as React from "react"
import { View, Pressable, Image, ViewStyle, StyleProp, ImageStyle, Dimensions } from "react-native"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"

const { width } = Dimensions.get("window")

export type Props = {
  isFullscreen: boolean
  setFullscreen: (value: boolean) => void
  cameraEnabled?: boolean
  setCameraEnabled: (enabled: boolean) => void
  switchCamera: () => void
  // screenShareEnabled: boolean
  // setScreenShareEnabled: (enabled: boolean) => void
  style?: StyleProp<ViewStyle>
}
export const RoomControls = ({
  isFullscreen,
  setFullscreen,
  cameraEnabled = false,
  setCameraEnabled,
  switchCamera,
  // screenShareEnabled = false,
  // setScreenShareEnabled,
  style,
}: Props) => {
  const cameraImage = cameraEnabled
    ? require("../../assets/icons/baseline_videocam_white_24dp.png")
    : require("../../assets/icons/baseline_videocam_off_white_24dp.png")
  /** 
  const screenShareImage = screenShareEnabled
    ? require("../../assets/icons/baseline_cast_connected_white_24dp.png")
    : require("../../assets/icons/baseline_cast_white_24dp.png")
  */
  return (
    <View style={[style, $container, isFullscreen && $fullscreenPosition]}>
      <View style={$sidebarOverlay}>
        <View style={$sidebar(isFullscreen)}>
          <Pressable
            onPress={() => {
              setCameraEnabled(!cameraEnabled)
            }}
            style={$button}
          >
            <Image style={$icon} source={cameraImage} />
          </Pressable>
          <Pressable
            onPress={() => {
              switchCamera()
            }}
            style={$button}
          >
            <Image style={$icon} source={require("../../assets/icons/camera_flip_outline.png")} />
          </Pressable>
          {isFullscreen && (
            <Pressable
              onPress={() => {
                setFullscreen(false)
              }}
              style={$button}
            >
              <MaterialIcons name="fullscreen-exit" size={28} color="white" />
            </Pressable>
          )}

          {/** 
            <Pressable
              onPress={() => {
                setScreenShareEnabled(!screenShareEnabled)
              }}
            >
              <Image style={$icon} source={screenShareImage} />
            </Pressable>
            */}
        </View>
      </View>
    </View>
  )
}

const $container: ViewStyle = {
  width: "100%",
  flexDirection: "row",
  justifyContent: "flex-start",
  marginVertical: 8,
  position: "absolute",
  bottom: 8,
  zIndex: 1000,
}

const $icon: ImageStyle = {
  width: 32,
  height: 32,
}

const $button: ViewStyle = {
  backgroundColor: "626262",
  padding: 10,
  borderRadius: 25,
  alignItems: "center",
}

const $sidebarOverlay: ViewStyle = {
  justifyContent: "center",
  alignItems: "flex-start",
}

const $sidebar = (isFullscreen: boolean): ViewStyle => ({
  flexDirection: isFullscreen ? "row" : "column",
  width: isFullscreen ? width * 0.5 : width * 0.2, // 20% of screen width
  backgroundColor: "#222",
  borderRadius: 10,
  padding: 10,
  justifyContent: "center",
  alignContent: "center",
})

const $fullscreenPosition: ViewStyle = {
  position: "absolute",
  bottom: "2%",
  transform: [{ translateX: -125 }], // Adjust based on component width
}
