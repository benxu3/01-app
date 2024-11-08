import * as React from "react"

import { Image, ImageStyle, View, ViewStyle } from "react-native"
import {
  isTrackReference,
  TrackReferenceOrPlaceholder,
  useEnsureTrackRef,
  useIsMuted,
  useIsSpeaking,
  useParticipantInfo,
  VideoTrack,
} from "@livekit/react-native"
import { Text } from "./Text"
import { useTheme } from "@react-navigation/native"
import { Track } from "livekit-client"
import { spacing } from "app/theme"

export type ParticipantViewProps = {
  trackRef: TrackReferenceOrPlaceholder
  style?: ViewStyle
  zOrder?: number
  mirror?: boolean
}

export const ParticipantView = ({ trackRef, zOrder, mirror, style }: ParticipantViewProps) => {
  const trackReference = useEnsureTrackRef(trackRef)
  const { identity, name } = useParticipantInfo({
    participant: trackReference.participant,
  })
  const isSpeaking = useIsSpeaking(trackRef.participant)
  const isVideoMuted = useIsMuted(trackRef)
  const { colors } = useTheme()
  let videoView

  if (isTrackReference(trackRef) && !isVideoMuted) {
    videoView = (
      <VideoTrack style={$videoView} trackRef={trackRef} zOrder={zOrder} mirror={mirror} />
    )
  } else {
    videoView = (
      <View style={$videoView}>
        <View style={$spacer} />
        <Image
          style={$icon}
          source={require("../../assets/icons/baseline_videocam_off_white_24dp.png")}
        />
        <View style={$spacer} />
      </View>
    )
  }

  let displayName = name || identity
  if (trackRef.source === Track.Source.ScreenShare) {
    displayName = displayName + "'s screen"
  }

  return (
    <View style={[style, $container]}>
      {videoView}
      <View style={$identityBar}>
        <Text style={{ color: colors.text }}>{displayName}</Text>
      </View>
      {isSpeaking && <View style={$speakingIndicator} />}
    </View>
  )
}

const $container: ViewStyle = {
  backgroundColor: "#00153C",
  borderRadius: 25,
  overflow: "hidden",
}

const $speakingIndicator: ViewStyle = {
  position: "absolute",
  bottom: 0,
  width: "100%",
  height: "100%",
  borderColor: "#007DFF",
  borderWidth: 3,
}

const $spacer: ViewStyle = {
  flex: 1,
}

const $videoView: ViewStyle = {
  width: "100%",
  height: "100%",
}

const $identityBar: ViewStyle = {
  position: "absolute",
  bottom: 0,
  paddingLeft: spacing.md,
  paddingBottom: spacing.md,
  width: "100%",
  padding: 2,
}

const $icon: ImageStyle = {
  width: 40,
  height: 40,
  alignSelf: "center",
}
