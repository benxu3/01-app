import React, { useState, useCallback } from "react"
import { View, TouchableOpacity, ViewStyle, TextStyle, Dimensions } from "react-native"
import { TextField } from "./TextField"
import FontAwesome6 from "@expo/vector-icons/FontAwesome6"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { useStores } from "../models"
import { FloatingActionButton } from "./FloatingActionButton"
import { SharedValue } from "react-native-reanimated"
import { spacing } from "app/theme"

type ChatMessageInputProps = {
  onSend?: (message: string) => void
  isDarkMode: boolean
  handlePlusIcon: () => void
  isExpanded: SharedValue<boolean>
}

const SCREEN_WIDTH = Dimensions.get("window").width

export const ChatMessageInput = ({
  onSend,
  isDarkMode,
  handlePlusIcon,
  isExpanded,
}: ChatMessageInputProps) => {
  const [message, setMessage] = useState("")
  const { settingStore } = useStores()

  const handleSend = useCallback(() => {
    if (!onSend || message === "") {
      return
    }
    onSend(message)
    if (settingStore.pushToTalk) {
      onSend("{COMPLETE}")
    }
    setMessage("")
  }, [onSend, message])

  const backgroundColor = isDarkMode ? "black" : "white"
  const textColor = isDarkMode ? "white" : "black"
  const placeholderText = "Type a message"

  const handleFullscreen = () => {
    if (!settingStore.wearable) {
      isExpanded.value = false
    }

    settingStore.setProp("wearable", !settingStore.wearable)
  }

  return (
    <View style={$inputContainer}>
      <FloatingActionButton
        isExpanded={isExpanded}
        isPrimary
        onPress={handlePlusIcon}
        isDarkMode={isDarkMode}
      />
      <TextField
        value={message}
        onChangeText={setMessage}
        placeholder={placeholderText}
        style={[$input, { color: textColor }]}
        containerStyle={$textFieldContainer}
        inputWrapperStyle={[$inputWrapper(isDarkMode), { backgroundColor }]}
        onSubmitEditing={handleSend}
        RightAccessory={() =>
          message.length > 0 && (
            <TouchableOpacity style={$sendButton} onPress={handleSend} disabled={!onSend}>
              <FontAwesome6
                name="circle-arrow-up"
                size={32}
                color={isDarkMode ? "white" : "black"}
              />
            </TouchableOpacity>
          )
        }
      />
      <TouchableOpacity style={$fullscreenButton} onPress={handleFullscreen}>
        <View style={$fullscreenIconContainer(isDarkMode)}>
          <MaterialIcons name="fullscreen" size={24} color="white" />
        </View>
      </TouchableOpacity>
    </View>
  )
}

const $fullscreenIconContainer = (isDarkMode: boolean): ViewStyle => ({
  width: 34,
  height: 34,
  borderRadius: 17,
  backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)",
  justifyContent: "center",
  alignItems: "center",
})

const $fullscreenButton: ViewStyle = {
  width: 34,
  height: 34,
  backgroundColor: "transparent",
  borderRadius: 17,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "row",
  margin: spacing.xxs,
  marginLeft: spacing.md,
}

const $inputContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  paddingTop: 8,
  paddingBottom: 4,
  width: "100%",
  zIndex: 10,
}

const $textFieldContainer: ViewStyle = {
  flex: 1,
  width: SCREEN_WIDTH - 32,
}

const $inputWrapper = (isDarkMode: boolean): ViewStyle => ({
  borderRadius: 35,
  paddingHorizontal: 12,
  borderColor: isDarkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)",
})

const $input: TextStyle = {
  flex: 1,
  fontSize: 16,
  marginLeft: 5,
  height: 24 * 0.95, // TextField component height is 24
}

const $sendButton: ViewStyle = {
  paddingRight: 4,
  alignSelf: "center",
}
