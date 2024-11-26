import { Instance, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"

/**
 * Represents a connection to an E2B instance
 */
export const SettingStoreModel = types
  .model("SettingStore")
  .props({
    backup: types.optional(types.boolean, false),
    safety: types.optional(types.boolean, false),
    terms: types.optional(types.boolean, false),
    pushToTalk: types.optional(types.boolean, true),
    wearable: types.optional(types.boolean, false),
    alwaysListening: types.optional(types.boolean, false),
    autorun: types.optional(types.boolean, false),
  })
  .actions(withSetPropAction)
  .actions((self) => ({
    requireStart(sendChat: (message: string) => void) {
      if (self.pushToTalk) {
        sendChat("{REQUIRE_START_ON}")
        console.log("REQUIRE START ON")
      }
    },

    unrequireStart(sendChat: (message: string) => void) {
      if (!self.pushToTalk) {
        sendChat("{REQUIRE_START_OFF}")
        console.log("REQUIRE START OFF")
      }
    },
  }))
  .actions((self) => ({
    autorunOn(sendChat: (message: string) => void) {
      if (self.autorun) {
        sendChat("{AUTO_RUN_ON}")
        console.log("AUTO_RUN ON")
      }
    },

    autorunOff(sendChat: (message: string) => void) {
      if (!self.autorun) {
        sendChat("{AUTO_RUN_OFF}")
        console.log("AUTO_RUN OFF")
      }
    },
  }))
  .actions((self) => ({
    reset() {
      self.setProp("backup", false)
      self.setProp("safety", false)
      self.setProp("terms", false)
      self.setProp("pushToTalk", true)
      self.setProp("wearable", false)
      self.setProp("alwaysListening", false)
      self.setProp("autorun", false)
    },
  }))

export interface SettingStore extends Instance<typeof SettingStoreModel> {}
