import {
  useCameraPermission,
  useCameraDevice,
  Camera,
  useCodeScanner,
  CameraPermissionStatus,
} from "react-native-vision-camera"
import React, { FC, useCallback, useState } from "react"
import { ViewStyle, TextStyle, Alert, StyleSheet, View, Linking, Text } from "react-native"
import { useStores } from "../models"
import { AppStackScreenProps } from "../navigators"
import { spacing } from "../theme"
import { observer } from "mobx-react-lite"

interface ScanScreenProps extends AppStackScreenProps<"Scan"> {}

export const ScanScreen: FC<ScanScreenProps> = observer(function ScanScreen(_props) {
  const device = useCameraDevice("back")
  const { hasPermission } = useCameraPermission()
  const { connectionStore } = useStores()
  const [showCamera, setShowCamera] = useState(true)

  const { navigation } = _props
  const [cameraPermissionStatus, setCameraPermissionStatus] =
    useState<CameraPermissionStatus>("not-determined")

  const requestCameraPermission = useCallback(async () => {
    console.log("Requesting camera permission...")
    const permission = await Camera.requestCameraPermission()
    console.log(`Camera permission status: ${permission}`)

    if (permission === "denied") await Linking.openSettings()
    setCameraPermissionStatus(permission)
  }, [])

  const codeScanner = useCodeScanner({
    codeTypes: ["qr"],
    onCodeScanned: async (codes) => {
      const data = codes[0].value as string
      await connectionStore.local_connect(data)

      if (connectionStore.error) {
        // handle error
        Alert.alert("Error connecting to your server, please try again")
        connectionStore.clearError()
        navigation.navigate("Login")
        return
      }

      // Unmount the camera before navigating
      setShowCamera(false)

      navigation.navigate("Room")
    },
  })

  if (!hasPermission)
    return (
      <View style={$container}>
        <Text style={$welcome}>Welcome {"\n"}to the 01.</Text>
        <View style={$permissionsContainer}>
          {cameraPermissionStatus !== "granted" && (
            <Text style={$permissionText}>
              The 01 needs <Text style={$bold}>Camera permission</Text>.{"\n"}
              <Text style={$hyperlink} onPress={requestCameraPermission}>
                Grant
              </Text>
            </Text>
          )}
        </View>
      </View>
    )
  if (device == null)
    return (
      <View style={$container}>
        <Text style={$welcome}>Welcome to the{"\n"}01.</Text>
        <View style={$permissionsContainer}>
          {cameraPermissionStatus !== "granted" && (
            <Text style={$permissionText}>
              The 01 requires <Text style={$bold}>Camera functionality</Text>, but we weren't able
              to detect your device camera.
            </Text>
          )}
        </View>
      </View>
    )
  return (
    <View style={StyleSheet.absoluteFill}>
      {showCamera && (
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive
          codeScanner={codeScanner}
        />
      )}
    </View>
  )
})

const $container: ViewStyle = {
  paddingTop: spacing.lg + spacing.xl,
  paddingHorizontal: spacing.lg,
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "white",
}

const $welcome: TextStyle = {
  fontSize: 38,
  fontWeight: "bold",
  maxWidth: "80%",
}

const $permissionsContainer: ViewStyle = {
  marginTop: spacing.lg * 2,
}

const $permissionText: TextStyle = {
  fontSize: 17,
}

const $hyperlink: TextStyle = {
  color: "#007aff",
  fontWeight: "bold",
}

const $bold: TextStyle = {
  fontWeight: "bold",
}
