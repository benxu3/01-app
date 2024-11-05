// plugins/withForegroundService.ts
import { withAndroidManifest, ConfigPlugin } from "@expo/config-plugins"

const withForegroundService: ConfigPlugin = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults

    // Ensure the manifest structure is correct
    if (
      !manifest.manifest ||
      !manifest.manifest.application ||
      !Array.isArray(manifest.manifest.application)
    ) {
      throw new Error("Invalid AndroidManifest.xml structure")
    }

    const application = manifest.manifest.application[0]

    // Initialize services array if it doesn't exist
    application.service = application.service || []

    // Helper function to add a service if it doesn't already exist
    const addServiceIfNotExists = (serviceObj: any) => {
      const services = application.service
      if (services) {
        const exists = services.some(
          (s: any) => s.$["android:name"] === serviceObj.$["android:name"],
        )
        if (!exists) {
          services.push(serviceObj)
        }
      }
    }

    // Define the foreground service for supersami/rn-foreground-service
    const supersamiService = {
      $: {
        "android:name": "com.supersami.foregroundservice.ForegroundService",
        "android:exported": "false",
        "android:foregroundServiceType": "camera|microphone|mediaPlayback",
      },
    }

    // Define the ForegroundServiceTask for supersami
    const supersamiServiceTask = {
      $: {
        "android:name": "com.supersami.foregroundservice.ForegroundServiceTask",
        "android:exported": "false",
      },
    }

    // Define the VIForegroundService for Voximplant
    const voximplantService = {
      $: {
        "android:name": "com.voximplant.foregroundservice.VIForegroundService",
        "android:exported": "false",
      },
    }

    // Add services
    addServiceIfNotExists(supersamiService)
    addServiceIfNotExists(supersamiServiceTask)
    addServiceIfNotExists(voximplantService)

    // Add necessary meta-data for supersami service
    const addMetaDataIfNotExists = (metaDataObj: any) => {
      const exists = application["meta-data"]?.some(
        (m: any) => m["$"]["android:name"] === metaDataObj["$"]["android:name"],
      )
      if (!exists) {
        application["meta-data"] = application["meta-data"] || []
        application["meta-data"].push(metaDataObj)
      }
    }

    const supersamiMetaDataName = {
      $: {
        "android:name": "com.supersami.foregroundservice.notification_channel_name",
        "android:value": "Call",
      },
    }

    const supersamiMetaDataDescription = {
      $: {
        "android:name": "com.supersami.foregroundservice.notification_channel_description",
        "android:value": "",
      },
    }

    addMetaDataIfNotExists(supersamiMetaDataName)
    addMetaDataIfNotExists(supersamiMetaDataDescription)

    return config
  })
}

export default withForegroundService
