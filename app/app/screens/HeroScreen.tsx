import React, { FC, useEffect, useState, useCallback, useRef } from "react"
import {
  ViewStyle,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ImageStyle,
  TextStyle,
} from "react-native"
import { Screen, Icon } from "../components"
import { ScreenStackScreenProps } from "../navigators/ScreenNavigator"
import { spacing } from "../theme"
import { TranscriptionTile } from "app/components/Transcript"
import { ChatMessageInput } from "../components/ChatMessageInput"
import { RoomControls } from "../components/RoomControl"
import {
  useLocalParticipant,
  useConnectionState,
  useVisualStableUpdate,
  useTracks,
} from "@livekit/react-native"
import { mediaDevices } from "@livekit/react-native-webrtc"

import {
  ConnectionState,
  TranscriptionSegment,
  RoomEvent,
  Participant,
  Track,
} from "livekit-client"
import { useChat, useRoomContext, useDataChannel } from "@livekit/components-react"
import { useStores } from "../models"
import { AgentVisualizer } from "../components/AgentVisualizer"
import { observer } from "mobx-react-lite"

// import { toJS } from "mobx"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
} from "react-native-reanimated"

import { AnimatedPressable, FloatingActionButton } from "../components/FloatingActionButton"
import { WelcomeScreenWrapper } from "./WelcomeScreen"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useAudioSetup } from "../utils/useAudioSetup"
import { useTheme } from "../utils/useTheme"
import AntDesign from "@expo/vector-icons/AntDesign"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { ParticipantView } from "../components/ParticipantView"

/**
const isSpecialMessage = (message: string): boolean => {
  const specialMessages = [
    "{START}",
    "{CONTEXT_MODE_ON}",
    "{CONTEXT_MODE_OFF}",
    "{REQUIRE_START_ON}",
    "{REQUIRE_START_OFF}",
    "{AUTO_RUN_ON}",
    "{AUTO_RUN_OFF}",
  ]
  return specialMessages.includes(message.trim())
}
*/

export interface TranscriptionSegmentWithParticipant extends TranscriptionSegment {
  participantId: string
}

export const HeroScreen: FC<ScreenStackScreenProps<"Hero">> = observer(function HeroScreen(_props) {
  const isRevealed = useRef(false)
  const [isCameraFrontFacing, setCameraFrontFacing] = useState(true)
  const [isFullscreen, setFullscreen] = useState(false)

  const { navigation } = _props

  const { isDarkMode } = useTheme()

  const { localParticipant, isCameraEnabled } = useLocalParticipant()
  const roomState = useConnectionState()
  const { settingStore } = useStores()
  const { send: sendChat } = useChat()

  const [transcriptions, setTranscriptions] = useState<{
    [id: string]: TranscriptionSegmentWithParticipant
  }>({})
  const room = useRoomContext()

  // const isWearable = toJS(settingStore.wearable)
  const insets = useSafeAreaInsets()
  const [_, setKeyboardVisible] = useState(false)
  const chatFlexValue = useSharedValue(7)
  const [accumulatedCode, setAccumulatedCode] = useState("")

  const { audioTrackReady, agentAudioTrack, unmute, mute } = useAudioSetup(
    localParticipant,
    roomState,
    settingStore,
    navigation,
  )

  // setup participant camera track
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  )
  const stableTracks = useVisualStableUpdate(tracks, 5)
  const participantTrack = stableTracks.find((track) => track.participant.name === "You")
  const participantView = participantTrack && <ParticipantView trackRef={participantTrack} />

  const updateTranscriptions = (segments: TranscriptionSegment[], participant?: Participant) => {
    setTranscriptions((prev) => {
      const newTranscriptions = { ...prev }

      for (const segment of segments) {
        newTranscriptions[segment.id] = {
          ...segment,
          participantId: participant?.identity ?? "unknown",
        }
      }
      return newTranscriptions
    })
  }

  useDataChannel("code", (msg) => {
    if (typeof msg === "object" && msg !== null && "payload" in msg) {
      const payload = Array.from(msg.payload as Uint8Array)
      const decodedPayload = String.fromCharCode(...payload)

      setAccumulatedCode((prevCode) => prevCode + decodedPayload)
    }
  })

  useEffect(() => {
    console.log("code block: ", accumulatedCode)
  }, [accumulatedCode])

  useEffect(() => {
    if (!room) {
      return
    }

    room.on(RoomEvent.TranscriptionReceived, updateTranscriptions)
    return () => {
      room.off(RoomEvent.TranscriptionReceived, updateTranscriptions)
    }
  }, [room])

  useEffect(() => {
    if (roomState === ConnectionState.Disconnected || roomState === ConnectionState.Reconnecting) {
      console.log("Connection Lost", "You have been disconnected from the room")
    }
  }, [roomState])

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true)
      chatFlexValue.value = 5
    })
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false)
      chatFlexValue.value = 7
    })

    return () => {
      keyboardDidShowListener.remove()
      keyboardDidHideListener.remove()
    }
  }, [])

  const chatAnimatedStyle = useAnimatedStyle(() => ({
    flex: isFullscreen ? 0 : chatFlexValue.value,
    display: isFullscreen ? "none" : "flex",
  }))

  const visualizerAnimatedStyle = useAnimatedStyle(() => ({
    flex: isFullscreen ? 1 : 2,
    paddingTop: isFullscreen ? insets.top : 0,
    position: "relative", // Add this
    zIndex: 2, // Add this - middle layer
  }))

  const inputAnimatedStyle = useAnimatedStyle(() => ({
    flex: isFullscreen ? 0 : 1,
    display: isFullscreen ? "none" : "flex",
  }))

  const handleSettings = useCallback(() => {
    navigation.navigate("Settings")
  }, [])

  const toggleFullscreen = useCallback(() => {
    setFullscreen(!isFullscreen)
  }, [])

  // Animation state for RoomControls visibility
  const isExpanded = useSharedValue(false)

  const handlePress = () => {
    isExpanded.value = !isExpanded.value
  }

  const $plusIconStyle = useAnimatedStyle(() => {
    const moveValue = interpolate(Number(isExpanded.value), [0, 1], [0, 2])
    const translateValue = withTiming(moveValue)
    const rotateValue = isExpanded.value ? "45deg" : "0deg"

    return {
      transform: [{ translateX: translateValue }, { rotate: withTiming(rotateValue) }],
    }
  })

  return (
    <View style={$heroContainer}>
      {agentAudioTrack && audioTrackReady ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={$keyboardAvoidingView}
        >
          <Animated.View style={[$animatedContainer, chatAnimatedStyle]}>
            <Screen
              preset="fixed"
              backgroundColor={$darkMode(isDarkMode)}
              contentContainerStyle={$topContainer(isDarkMode)}
            >
              <TranscriptionTile transcripts={transcriptions} />
            </Screen>
          </Animated.View>

          <Animated.View style={[$animatedContainer, visualizerAnimatedStyle]}>
            <TouchableOpacity
              testID="audioVisualizer"
              style={$fullSize}
              onPressIn={settingStore.pushToTalk ? unmute : undefined}
              onPressOut={settingStore.pushToTalk ? mute : undefined}
              activeOpacity={1}
            >
              <Screen
                preset="fixed"
                backgroundColor={$darkMode(isDarkMode)}
                contentContainerStyle={[
                  $bottomContainer(isDarkMode),
                  $justifyBottomContainer(isFullscreen),
                ]}
                safeAreaEdges={isRevealed.current ? ["top"] : []}
              >
                {isCameraEnabled ? (
                  <View style={$participantView}>{participantView}</View>
                ) : (
                  <AgentVisualizer />
                )}
                {isFullscreen && (
                  <RoomControls
                    isFullscreen={isFullscreen}
                    setFullscreen={setFullscreen}
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
                  />
                )}
              </Screen>
            </TouchableOpacity>
          </Animated.View>

          <View style={$floatingButtonContainer}>
            <FloatingActionButton isExpanded={isExpanded} index={1} buttonLetter={"M"} />
            <FloatingActionButton isExpanded={isExpanded} index={2} buttonLetter={"W"} />
            <FloatingActionButton isExpanded={isExpanded} index={3} buttonLetter={"S"} />
          </View>

          <Animated.View style={[$animatedContainer, inputAnimatedStyle]}>
            <Screen
              preset="fixed"
              backgroundColor={$darkMode(isDarkMode)}
              contentContainerStyle={$chatInputContainer(isDarkMode)}
            >
              {isDarkMode ? (
                <>
                  <AnimatedPressable onPress={handlePress} style={[$shadow, $mainButton]}>
                    <Animated.Text style={[$plusIconStyle, $content]}>+</Animated.Text>
                  </AnimatedPressable>
                </>
              ) : (
                <>
                  <AnimatedPressable onPress={handlePress} style={[$shadow, $mainButton]}>
                    <Animated.Text style={[$plusIconStyle, $content]}>+</Animated.Text>
                  </AnimatedPressable>
                </>
              )}
              <ChatMessageInput
                placeholder="Type a message"
                onSend={sendChat}
                isDarkMode={isDarkMode}
              />
              <TouchableOpacity style={$fullscreenButton} onPress={toggleFullscreen}>
                <View style={$plusIconContainer(isDarkMode)}>
                  <MaterialIcons name="fullscreen" size={28} color="white" />
                </View>
              </TouchableOpacity>
            </Screen>
          </Animated.View>

          <View testID="settingsIcon" style={$settingContainer}>
            <Icon
              icon="cog"
              size={36}
              color={isDarkMode ? "white" : "black"}
              onPress={handleSettings}
            />
          </View>
        </KeyboardAvoidingView>
      ) : (
        <WelcomeScreenWrapper />
      )}
      {/**
      <Animated.View
        style={controlsAnimatedStyle}
        pointerEvents={controlsVisible.value ? "auto" : "none"}
      >
        <RoomControls
          isFullscreen={isFullscreen}
          setFullscreen={setFullscreen}
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
        />
         TODO: add back as prop to rooncontrol once added
              screenShareEnabled={isScreenShareEnabled}
              setScreenShareEnabled={(enabled: boolean) => {
                if (enabled) {
                  startBroadcast()
                } else {
                  localParticipant.setScreenShareEnabled(enabled)
                }
              }}
            
      </Animated.View>
      */}
    </View>
  )
})

const $darkMode = (isDarkMode: boolean): string => (isDarkMode ? "black" : "white")

const $heroContainer: ViewStyle = {
  flex: 1,
  position: "relative",
}

const $fullSize: ViewStyle = {
  flex: 1,
  width: "100%",
}

const $animatedContainer: ViewStyle = {
  overflow: "hidden",
  position: "relative", // Add this
  zIndex: 1, // Add this - base layer
}

const $settingContainer: ViewStyle = {
  position: "absolute",
  top: spacing.xl + spacing.xl,
  right: spacing.xl,
  zIndex: 1000,
  opacity: 0.5,
}

const $keyboardAvoidingView: ViewStyle = {
  flex: 1,
  backgroundColor: "black",
}

const $participantView: ImageStyle = {
  width: "100%",
}

const $topContainer = (isDarkMode: boolean): ViewStyle => ({
  paddingTop: spacing.lg + spacing.xl,
  paddingHorizontal: spacing.md,
  flex: 1,
  backgroundColor: isDarkMode ? "black" : "white",
})

const $bottomContainer = (isDarkMode: boolean): ViewStyle => ({
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.xs,
  flex: 1,
  alignItems: "center",
  backgroundColor: isDarkMode ? "black" : "white",
})

const $justifyBottomContainer = (isFullscreen: boolean): ViewStyle => ({
  justifyContent: isFullscreen ? "center" : "flex-start",
})

const $chatInputContainer = (isDarkMode: boolean): ViewStyle => ({
  paddingBottom: spacing.md + spacing.xxs,
  paddingRight: spacing.md,
  paddingLeft: spacing.sm,
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: isDarkMode ? "black" : "white",
  width: "100%",
  flexDirection: "row",
  paddingTop: 8,
  position: "relative", // Add this
  overflow: "visible", // Add this
})

const $fullscreenButton: ViewStyle = {
  padding: spacing.xxs,
  paddingLeft: spacing.md,
  alignSelf: "center",
}

const $plusIconContainer = (isDarkMode: boolean): ViewStyle => ({
  width: 34,
  height: 34,
  borderRadius: 17,
  backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)",
  justifyContent: "center",
  alignItems: "center",
})

const $mainButton: ViewStyle = {
  zIndex: 2000,
  elevation: 10,
  height: 34,
  width: 34,
  borderRadius: 100,
  backgroundColor: "#626262",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}

const $content: TextStyle = {
  fontSize: 24,
  color: "#f8f9ff",
}

const $shadow: ViewStyle = {
  shadowColor: "#171717",
  shadowOffset: { width: -0.5, height: 3.5 },
  shadowOpacity: 0.2,
  shadowRadius: 3,
}

const $floatingButtonContainer: ViewStyle = {
  position: "absolute",
  left: spacing.sm,
  right: 0,
  bottom: 0,
  zIndex: 1000,
  pointerEvents: "box-none",
  elevation: 5, // For Android
  height: spacing.lg + spacing.xxxl,
}
