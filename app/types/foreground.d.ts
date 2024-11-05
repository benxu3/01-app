declare module "@voximplant/react-native-foreground-service"

declare module "@supersami/rn-foreground-service" {
  import { ServiceEndpoint, NotificationProps } from "react-native-foreground-service"

  export function startService(props: NotificationProps): Promise<void>
  export function stopService(): Promise<void>
  export function registerService(config: ServiceEndpoint): void
}
