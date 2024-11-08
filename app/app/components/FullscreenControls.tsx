import * as React from "react"
import { View, Pressable, ViewStyle, Dimensions } from "react-native"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import FontAwesome6 from "@expo/vector-icons/FontAwesome6"
import { useStores } from "app/models"
import { spacing } from "app/theme"

const { width } = Dimensions.get("window")

export type Props = {
  cameraEnabled?: boolean
  setCameraEnabled: (enabled: boolean) => void
  switchCamera: () => void
  // screenShareEnabled: boolean
  // setScreenShareEnabled: (enabled: boolean) => void
}
export const RoomControls = ({
  cameraEnabled = false,
  setCameraEnabled,
  switchCamera,
}: // screenShareEnabled = false,
// setScreenShareEnabled,
Props) => {
  const { settingStore } = useStores()
  const cameraImage = cameraEnabled ? (
    <FontAwesome6 name="video" size={24} color="white" />
  ) : (
    <FontAwesome6 name="video-slash" size={24} color="white" />
  )
  /** 
  const screenShareImage = screenShareEnabled
    ? require("../../assets/icons/baseline_cast_connected_white_24dp.png")
    : require("../../assets/icons/baseline_cast_white_24dp.png")
  */
  return (
    <View style={$container}>
      <View style={$sidebar}>
        <Pressable
          onPress={() => {
            setCameraEnabled(!cameraEnabled)
          }}
          style={$button}
        >
          {cameraImage}
        </Pressable>
        {cameraEnabled && (
          <Pressable
            onPress={() => {
              switchCamera()
            }}
            style={$button}
          >
            <FontAwesome6 name="camera-rotate" size={26} color="white" />
          </Pressable>
        )}

        {settingStore.wearable && (
          <Pressable
            onPress={() => {
              settingStore.setProp("wearable", false)
            }}
            style={$button}
          >
            <MaterialIcons name="fullscreen-exit" size={32} color="white" />
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
  )
}

const $container: ViewStyle = {
  width: "100%",
  flexDirection: "row",
  justifyContent: "center",
  margin: spacing.md,
}

const $button: ViewStyle = {
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  padding: spacing.sm,
  marginHorizontal: spacing.xs,
  marginVertical: spacing.sm,
  borderRadius: 30,
  alignItems: "center",
  justifyContent: "center",
  width: 72,
}

const $sidebar: ViewStyle = {
  flexDirection: "row",
  width: width * 0.7,
  backgroundColor: "#222",
  borderRadius: 20,
  justifyContent: "center",
  alignContent: "center",
}
