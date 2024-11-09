import React, { FC, useEffect } from "react"
import { ScreenNavigator } from "../navigators/ScreenNavigator"
import { AudioSession, LiveKitRoom } from "@livekit/react-native"
import { useStores } from "../models"
import { Alert, ViewStyle, View, Platform } from "react-native"
import { AppStackScreenProps } from "../navigators"
import { observer } from "mobx-react-lite"
import { WelcomeScreenWrapper } from "./WelcomeScreen"
import { ThemeProvider } from "../theme/Theme"
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions"

interface RoomScreenProps extends AppStackScreenProps<"Room"> {}

export const RoomScreen: FC<RoomScreenProps> = observer(function RoomScreen(_props) {
  const { connectionStore } = useStores()
  const { navigation } = _props
  const [isReady, setIsReady] = React.useState(false)

  const checkAndRequestPermissions = async () => {
    const permission = Platform.select({
      ios: PERMISSIONS.IOS.MICROPHONE,
      android: PERMISSIONS.ANDROID.RECORD_AUDIO,
    })

    if (!permission) return false

    try {
      const result = await check(permission)

      if (result === RESULTS.DENIED) {
        const permissionResult = await request(permission)
        return permissionResult === RESULTS.GRANTED
      }

      return result === RESULTS.GRANTED
    } catch (error) {
      console.error("Permission check failed:", error)
      return false
    }
  }

  // Start the audio session first.
  useEffect(() => {
    const start = async () => {
      const hasPermissions = await checkAndRequestPermissions()
      if (!hasPermissions) {
        Alert.alert(
          "Permissions Required",
          "Microphone access is required for this app to function.",
        )
        navigation.navigate("Login")
        return
      }

      await AudioSession.startAudioSession()

      if (connectionStore.error) {
        Alert.alert("Error connecting to our servers, please reconnect")
        connectionStore.clearError()
        navigation.navigate("Login")
      } else {
        setIsReady(true)
      }
    }

    start()

    return () => {
      AudioSession.stopAudioSession()
      connectionStore.disconnect()
    }
  }, [])

  return (
    <View style={$darkModeView}>
      {!isReady ? (
        <WelcomeScreenWrapper />
      ) : (
        <ThemeProvider>
          <LiveKitRoom
            serverUrl={connectionStore.livekitUrl}
            token={connectionStore.token}
            connect={true}
            options={{
              // Use screen pixel density to handle screens with differing densities.
              adaptiveStream: { pixelDensity: "screen" },
            }}
            audio={true}
            video={false}
          >
            <ScreenNavigator />
          </LiveKitRoom>
        </ThemeProvider>
      )}
    </View>
  )
})

const $darkModeView: ViewStyle = {
  flex: 1,
  backgroundColor: "black",
}
