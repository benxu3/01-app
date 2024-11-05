import type { SimulationScenario } from "livekit-client"
import React from "react"
import { FlatList, ListRenderItem, Pressable, Text, View, ViewStyle, TextStyle } from "react-native"

export type Props = {
  onSelect: (scenario: SimulationScenario) => void
}
export const SimulateScenarioList = ({ onSelect }: Props) => {
  const scenarios: SimulationScenario[] = [
    "signal-reconnect",
    "speaker",
    "node-failure",
    "server-leave",
    "migration",
    "resume-reconnect",
    "force-tcp",
    "force-tls",
    "full-reconnect",
  ]

  const render: ListRenderItem<SimulationScenario> = ({ item }) => {
    return (
      <Pressable
        onPress={() => {
          onSelect(item)
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
      <Text style={$titleTextStyle}>{"Select Simulation"}</Text>
      <View style={$spacer} />
      <FlatList data={scenarios} renderItem={render} keyExtractor={(item) => item} />
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
