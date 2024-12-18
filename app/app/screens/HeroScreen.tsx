import React, { FC, useEffect, useState, useCallback, useRef } from "react"
import {
  ViewStyle,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native"
import { Screen, Icon } from "../components"
import { ScreenStackScreenProps } from "../navigators/ScreenNavigator"
import { spacing } from "../theme"
import { TranscriptionTile } from "app/components/Transcript"
import { ChatMessageInput } from "../components/ChatMessageInput"
import {
  useLocalParticipant,
  useConnectionState,
  useTracks,
  useVisualStableUpdate,
} from "@livekit/react-native"
import {
  ConnectionState,
  Track,
  TranscriptionSegment,
  Participant,
  RoomEvent,
} from "livekit-client"
import {
  useChat,
  useRoomContext,
  useDataChannel,
  useTrackTranscription,
} from "@livekit/components-react"
import { mediaDevices } from "@livekit/react-native-webrtc"
import { useStores } from "../models"
import { AudioVisualizer } from "../components/AudioVisualizer"
import { observer } from "mobx-react-lite"
import { toJS } from "mobx"
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"
import { WelcomeScreenWrapper } from "./WelcomeScreen"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useAudioSetup } from "../utils/useAudioSetup"
import { useTheme } from "../utils/useTheme"
import { FloatingActionMenu } from "app/components/FloatingActionMenu"
import { ParticipantView } from "app/components/ParticipantView"
import { RoomControls } from "app/components/FullscreenControls"

export interface TranscriptionSegmentWithParticipant extends TranscriptionSegment {
  participantId: string
}

export interface UnifiedMessage {
  id: string
  text: string
  timestamp: number
  participantId: string
}

export const HeroScreen: FC<ScreenStackScreenProps<"Hero">> = observer(function HeroScreen(_props) {
  const isRevealed = useRef(false)
  const { navigation } = _props

  const { isDarkMode } = useTheme()

  const { localParticipant, isCameraEnabled, microphoneTrack } = useLocalParticipant()
  const [isCameraFrontFacing, setCameraFrontFacing] = useState(true)
  const roomState = useConnectionState()
  const { settingStore } = useStores()
  const { send: sendChat } = useChat()

  const [transcriptions, setTranscriptions] = useState<{
    [id: string]: TranscriptionSegmentWithParticipant
  }>({})

  const [messages, setMessages] = useState<UnifiedMessage[]>([])
  const { chatMessages } = useChat()

  const isWearable = toJS(settingStore.wearable)
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

  const localMessages = useTrackTranscription({
    publication: microphoneTrack,
    source: Track.Source.Microphone,
    participant: localParticipant,
  })

  const room = useRoomContext()
  // setup participant camera track
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  )
  const stableTracks = useVisualStableUpdate(tracks, 5)

  // Add this near other useSharedValue declarations
  const scale = useSharedValue(1)

  // Add these animation handlers
  const handlePressIn = () => {
    scale.value = withSpring(0.95)
    if (settingStore.pushToTalk) unmute()
  }

  const handlePressOut = () => {
    scale.value = withSpring(1)
    if (settingStore.pushToTalk) mute()
  }

  // Add this animated style
  const $scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    flex: 1,
    width: "100%",
  }))

  const participantTrack = stableTracks.find((track) => track.participant.name === "You")
  const participantView = participantTrack && (
    <Animated.View style={$scaleStyle}>
      <ParticipantView trackRef={participantTrack} />
    </Animated.View>
  )

  const updateTranscriptions = (segments: TranscriptionSegment[], participant?: Participant) => {
    setTranscriptions((prev) => {
      const newTranscriptions = { ...prev }
      for (const segment of segments) {
        newTranscriptions[segment.id.toString()] = {
          ...segment,
          participantId: participant?.identity ?? "unknown",
        }
      }
      return newTranscriptions
    })
  }

  useEffect(() => {
    updateTranscriptions(localMessages.segments, localParticipant)
  }, [localMessages.segments, localParticipant])

  useEffect(() => {
    const transcriptionMessages: UnifiedMessage[] = Object.values(transcriptions).map(
      (segment) => ({
        id: segment.id,
        text: segment.text,
        timestamp: segment.firstReceivedTime,
        participantId: segment.participantId,
      }),
    )

    const excludedMessages = ["{COMPLETE}", "{REQUIRE_START_ON}", "{REQUIRE_START_OFF}"]

    const chatUnifiedMessages: UnifiedMessage[] = chatMessages
      .filter((msg) => !excludedMessages.includes(msg.message))
      .map((msg) => ({
        id: msg.id,
        text: msg.message,
        timestamp: msg.timestamp,
        participantId: msg.from?.identity ?? "unknown",
      }))

    setMessages([...transcriptionMessages, ...chatUnifiedMessages])
  }, [transcriptions, chatMessages])

  useEffect(() => {
    if (!room) return

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

    settingStore.autorunOff(sendChat)

    return () => {
      keyboardDidShowListener.remove()
      keyboardDidHideListener.remove()
    }
  }, [])

  const chatAnimatedStyle = useAnimatedStyle(() => ({
    flex: isWearable ? 0 : chatFlexValue.value,
    display: isWearable ? "none" : "flex",
  }))

  const visualizerAnimatedStyle = useAnimatedStyle(() => ({
    flex: isWearable ? 1 : 2,
    paddingTop: isWearable ? insets.top : 0,
  }))

  const inputAnimatedStyle = useAnimatedStyle(() => ({
    flex: isWearable ? 0 : 1,
    display: isWearable ? "none" : "flex",
  }))

  const handleSettings = useCallback(() => {
    navigation.navigate("Settings")
  }, [])

  const isExpanded = useSharedValue(false)

  const handlePress = () => {
    isExpanded.value = !isExpanded.value
  }

  useDataChannel("code", (msg) => {
    if (typeof msg === "object" && msg !== null && "payload" in msg) {
      const payload = Array.from(msg.payload as Uint8Array)
      const decodedPayload = String.fromCharCode(...payload)

      if (decodedPayload === "{CLEAR}") {
        // Perform side effects after code block is complete
        console.log("Code block complete:", accumulatedCode)

        console.log("AUTORUN IS ", settingStore.autorun)
        // CHECK IF WE ARE ON AUTORUN TRUE OR FALSE
        // in AUTORUN FALSE we should ask the user to respond with "yes" if they want to run the code

        // Reset accumulated code after processing
        setAccumulatedCode("")
      } else {
        setAccumulatedCode((prevCode) => prevCode + decodedPayload)
      }
    }
  })

  useEffect(() => {
    console.log("code block: ", accumulatedCode)
  }, [accumulatedCode])

  return (
    <>
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
              <TranscriptionTile messages={messages} />
            </Screen>
          </Animated.View>

          <Animated.View style={[$animatedContainer, visualizerAnimatedStyle]}>
            <TouchableOpacity
              testID="audioVisualizer"
              style={$fullSize}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              activeOpacity={1}
            >
              <Screen
                preset="fixed"
                backgroundColor={$darkMode(isDarkMode)}
                contentContainerStyle={[
                  $bottomContainer(isDarkMode),
                  $justifyBottomContainer(isWearable),
                ]}
                safeAreaEdges={isRevealed.current ? ["top"] : []}
              >
                {isCameraEnabled ? (
                  <View style={[$fullSize, isWearable && $fullscreenParticipant]}>
                    {participantView}
                  </View>
                ) : (
                  <AudioVisualizer />
                )}

                {isWearable && (
                  <View style={$wearableControlsContainer}>
                    <RoomControls
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
                  </View>
                )}
              </Screen>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[$animatedContainer, inputAnimatedStyle]}>
            <Screen
              preset="fixed"
              backgroundColor={$darkMode(isDarkMode)}
              contentContainerStyle={$chatInputContainer(isDarkMode)}
            >
              <ChatMessageInput
                onSend={sendChat}
                isDarkMode={isDarkMode}
                handlePlusIcon={handlePress}
                isExpanded={isExpanded}
              />
            </Screen>
          </Animated.View>

          <FloatingActionMenu
            expanded={isExpanded}
            darkMode={isDarkMode}
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
    </>
  )
})

const $darkMode = (isDarkMode: boolean): string => (isDarkMode ? "black" : "white")

const $fullSize: ViewStyle = {
  flex: 1,
  width: "100%",
}

const $animatedContainer: ViewStyle = {
  overflow: "hidden",
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
  position: "relative",
})

const $justifyBottomContainer = (isWearable: boolean): ViewStyle => ({
  justifyContent: isWearable ? "center" : "flex-start",
})

const $wearableControlsContainer: ViewStyle = {
  position: "absolute",
  bottom: spacing.md,
  width: "100%",
  alignItems: "center",
}

const $fullscreenParticipant: ViewStyle = {
  marginBottom: spacing.xxxl * 2.1,
}

const $chatInputContainer = (isDarkMode: boolean): ViewStyle => ({
  paddingBottom: spacing.md,
  paddingRight: spacing.md,
  paddingLeft: spacing.sm,
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: isDarkMode ? "black" : "white",
  width: "100%",
})
