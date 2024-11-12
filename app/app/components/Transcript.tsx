import React, { useEffect } from "react"
import { ChatTile } from "./Chat"
import { Dimensions, View, ViewStyle } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useTheme } from "../utils/useTheme"
import { TranscriptionSegmentWithParticipant } from "../screens/HeroScreen"
import { Participant, Track, TranscriptionSegment } from "livekit-client"
import { useLocalParticipant, useTrackTranscription } from "@livekit/components-react"

export function TranscriptionTile({
  transcripts,
  setTranscripts,
}: {
  transcripts: { [id: string]: TranscriptionSegmentWithParticipant }
  setTranscripts: React.Dispatch<
    React.SetStateAction<{ [id: string]: TranscriptionSegmentWithParticipant }>
  >
}) {
  const { isDarkMode } = useTheme()

  const localParticipant = useLocalParticipant()
  const localMessages = useTrackTranscription({
    publication: localParticipant.microphoneTrack,
    source: Track.Source.Microphone,
    participant: localParticipant.localParticipant,
  })

  const updateTranscripts = (segments: TranscriptionSegment[], participant: Participant) => {
    setTranscripts((prevTranscripts) => {
      const newTranscriptions = { ...prevTranscripts }
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
    updateTranscripts(localMessages.segments, localParticipant.localParticipant)
  }, [localMessages.segments, localParticipant.localParticipant])

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
      <ChatTile transcripts={transcripts} />
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
