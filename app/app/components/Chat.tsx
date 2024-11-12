import React, { useEffect, useRef } from "react"
import { View, ViewStyle, ScrollView, Dimensions } from "react-native"
import ChatMessage from "./ChatMessage"
import { spacing } from "../theme"
import { TranscriptionSegmentWithParticipant } from "../screens/HeroScreen"
import { useLocalParticipant } from "@livekit/react-native"

const windowHeight = Dimensions.get("window").height

export const ChatTile = ({
  transcripts,
}: {
  transcripts: { [id: string]: TranscriptionSegmentWithParticipant }
}) => {
  const scrollViewRef = useRef<ScrollView>(null)
  const { localParticipant } = useLocalParticipant()

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: false })
    }
  }, [transcripts])

  return (
    <View style={$container}>
      <ScrollView
        ref={scrollViewRef}
        style={$messagesContainer}
        contentContainerStyle={$messagesContent}
        scrollEventThrottle={16}
      >
        {Object.values(transcripts)
          .sort((a, b) => a.firstReceivedTime - b.firstReceivedTime)
          .map((segment) => (
            <ChatMessage
              key={segment.id}
              message={segment.text}
              isSelf={segment.participantId === localParticipant?.identity}
            />
          ))}
      </ScrollView>
    </View>
  )
}

const $container: ViewStyle = {
  flex: 1,
  width: "100%",
  height: "100%",
}

const $messagesContainer: ViewStyle = {
  width: "100%",
  flexGrow: 1,
  paddingHorizontal: spacing.md,
  height: windowHeight * 0.8,
}

const $messagesContent: ViewStyle = {
  flexGrow: 1,
  justifyContent: "flex-end",
  paddingBottom: spacing.xl + spacing.lg - spacing.xxs,
}
