/** 
import React, { FC, useState } from "react"
import {
  View,
  findNodeHandle,
  NativeModules,
  Platform,
  ViewStyle,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native"
import { RoomControls } from "../components/RoomControl"
import { ParticipantView } from "../components/ParticipantView"
import { ScreenStackScreenProps } from "../navigators/ScreenNavigator"
import {
  useLocalParticipant,
  useDataChannel,
  useRoomContext,
  useVisualStableUpdate,
  useTracks,
  type ReceivedDataMessage,
  useIOSAudioManagement,
} from "@livekit/react-native"
import { observer } from "mobx-react-lite"
// @ts-ignore
import { mediaDevices, ScreenCapturePickerView } from "@livekit/react-native-webrtc"
import Toast from "react-native-toast-message"

import { Track } from "livekit-client"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated"

const { width } = Dimensions.get("window")

export const VideoScreen: FC<ScreenStackScreenProps<"Video">> = observer(function VideoScreen(
  _props,
) {
  const { navigation } = _props
  const [isCameraFrontFacing, setCameraFrontFacing] = useState(true)
  const room = useRoomContext()

  useIOSAudioManagement(room, true)
  // Setup room listeners
  const { send } = useDataChannel((dataMessage: ReceivedDataMessage<string>) => {
    // @ts-ignore
    const decoder = new TextDecoder("utf-8")
    const message = decoder.decode(dataMessage.payload)

    let title = "Received Message"
    if (dataMessage.from != null) {
      title = "Received Message from " + dataMessage.from?.identity
    }
    Toast.show({
      type: "success",
      text1: title,
      text2: message,
    })
  })

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  )
  const stableTracks = useVisualStableUpdate(tracks, 5)

  // Setup views.
  const agentTrack = stableTracks.find((track) => track.participant.name !== "You")
  const participantTrack = stableTracks.find((track) => track.participant.name === "You")
  if (agentTrack?.participant) {
    agentTrack.participant.name = "Open Interpreter"
  }
  if (participantTrack?.participant) {
    participantTrack.participant.name = "You"
  }
  const stageView = agentTrack && <ParticipantView trackRef={agentTrack} style={$stage} />
  const participantView = participantTrack && <ParticipantView trackRef={participantTrack} />

  console.log("agent track is! ", agentTrack)
  console.log("participant track is!", participantTrack)

  const { isCameraEnabled, isMicrophoneEnabled, isScreenShareEnabled, localParticipant } =
    useLocalParticipant()

  // Prepare for iOS screenshare.
  const screenCaptureRef = React.useRef(null)
  const screenCapturePickerView = Platform.OS === "ios" && (
    <ScreenCapturePickerView ref={screenCaptureRef} />
  )

  const startBroadcast = async () => {
    if (Platform.OS === "ios") {
      const reactTag = findNodeHandle(screenCaptureRef.current)
      await NativeModules.ScreenCapturePickerViewManager.show(reactTag)
      localParticipant.setScreenShareEnabled(true)
    } else {
      localParticipant.setScreenShareEnabled(true)
    }
  }

  // Animation state for RoomControls visibility
  const controlsVisible = useSharedValue(0) // 0: hidden, 1: visible

  // Animated styles for RoomControls
  const controlsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(controlsVisible.value, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    }),
    transform: [
      {
        translateY: withTiming(controlsVisible.value === 1 ? 0 : 50, {
          duration: 300,
          easing: Easing.out(Easing.ease),
        }),
      },
    ],
  }))

  // Function to toggle RoomControls visibility
  const toggleControls = () => {
    controlsVisible.value = controlsVisible.value === 1 ? 0 : 1
  }

  return (
    <TouchableWithoutFeedback onPress={toggleControls}>
      <View style={$container}>
        <View style={$participantContainer}>
          {stageView}
          <View style={$clipContainer}>{participantView}</View>
        </View>
        <Animated.View style={[controlsAnimatedStyle, $controlsContainer]}>
          <RoomControls
            micEnabled={isMicrophoneEnabled}
            setMicEnabled={(enabled: boolean) => {
              localParticipant.setMicrophoneEnabled(enabled)
            }}
            cameraEnabled={isCameraEnabled}
            setCameraEnabled={(enabled: boolean) => {
              localParticipant.setCameraEnabled(enabled)
            }}
            switchCamera={async () => {
              const facingModeStr = !isCameraFrontFacing ? "front" : "environment"
              setCameraFrontFacing(!isCameraFrontFacing)

              const devices = await mediaDevices.enumerateDevices()
              let newDevice
              // @ts-ignore
              for (const device of devices) {
                // @ts-ignore
                if (device.kind === "videoinput" && device.facing === facingModeStr) {
                  newDevice = device
                  break
                }
              }

              if (newDevice == null) {
                return
              }

              // @ts-ignore
              await room.switchActiveDevice("videoinput", newDevice.deviceId)
            }}
            screenShareEnabled={isScreenShareEnabled}
            setScreenShareEnabled={(enabled: boolean) => {
              if (enabled) {
                startBroadcast()
              } else {
                localParticipant.setScreenShareEnabled(enabled)
              }
            }}
            sendData={(message: string) => {
              Toast.show({
                type: "success",
                text1: "Sending Message",
                text2: message,
              })

              // @ts-ignore
              const encoder = new TextEncoder()
              const encodedData = encoder.encode(message)
              send(encodedData, { reliable: true })
            }}
            onSimulate={(scenario) => {
              room.simulateScenario(scenario)
            }}
            onDisconnectClick={() => {
              navigation.pop()
            }}
          />
        </Animated.View>
        {screenCapturePickerView}
      </View>
    </TouchableWithoutFeedback>
  )
})

const $container: ViewStyle = {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
}

const $participantContainer: ViewStyle = {
  flex: 1,
  width: "100%",
  position: "relative",
}

const $stage: ViewStyle = {
  flex: 1,
  width: "100%",
}

const $clipContainer: ViewStyle = {
  overflow: "hidden",
  borderRadius: 15,
  position: "absolute",
  width: width * 0.3,
  height: width * 0.5,
  bottom: 20,
  right: 20,
}

const $controlsContainer: ViewStyle = {
  position: "absolute",
  bottom: 30,
  left: 0,
  right: 0,
  alignItems: "center",
}
*/
