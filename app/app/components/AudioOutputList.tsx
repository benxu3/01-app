import { AudioSession } from "@livekit/react-native"
import React, { useEffect, useState } from "react"
import { FlatList, ListRenderItem, Pressable, Text, View, ViewStyle, TextStyle } from "react-native"

export type Props = {
  onSelect: () => void
}
export const AudioOutputList = ({ onSelect }: Props) => {
  const [audioOutputs, setAudioOutputs] = useState<string[]>([])
  useEffect(() => {
    const loadAudioOutputs = async () => {
      const outputs = await AudioSession.getAudioOutputs()
      setAudioOutputs(outputs)
    }
    loadAudioOutputs()
  }, [])

  const selectOutput = async (deviceId: string) => {
    await AudioSession.selectAudioOutput(deviceId)
    onSelect()
  }
  const renderAudioOutput: ListRenderItem<string> = ({ item }) => {
    return (
      <Pressable
        onPress={() => {
          selectOutput(item)
        }}
      >
        <View style={$spacer} />
        <Text style={$itemTextStyle}>{item}</Text>
        <View style={$spacer} />
      </Pressable>
    )
  }
  return (
    <View>
      <Text style={$titleTextStyle}>{"Select Audio Output"}</Text>
      <View style={$spacer} />
      <FlatList data={audioOutputs} renderItem={renderAudioOutput} keyExtractor={(item) => item} />
    </View>
  )
}

const $spacer: ViewStyle = {
  paddingTop: 10,
}

const $titleTextStyle: TextStyle = {
  color: "white",
  fontWeight: "bold",
  textAlign: "center",
  fontSize: 24,
}

const $itemTextStyle: TextStyle = {
  color: "white",
  fontWeight: "bold",
  textAlign: "center",
  fontSize: 20,
}
