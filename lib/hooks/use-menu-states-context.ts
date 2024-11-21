import { Dispatch, SetStateAction, useContext } from "react";
import { MenuStates } from "../interface";
import { useLocalStorage } from "./use-local-storage";
import { MenuStatesContext } from "@/components/context-providers/context/menu-states";
import { encrypt } from "../security/simple-password";

export default function useMenuStatesContext() {
  const context:
    | {
        menuStates: MenuStates;
        setMenuStates: Dispatch<SetStateAction<MenuStates>>;
      }
    | undefined = useContext(MenuStatesContext);
  const { setValue } = useLocalStorage();

  function updateMenuStates(newMenuStates: Partial<MenuStates>) {
    if (context) {
      const updatedStates = { ...context.menuStates, ...newMenuStates };

      if (updatedStates.settings) {
        // Do not allow API token editing after password is set
        if (!updatedStates.settings.isPasswordSet) {
          const sttAPIKey = updatedStates.settings.sttAPIKey;
          const llmAPIKey = updatedStates.settings.llmAPIKey;
          const ttsAPIKey = updatedStates.settings.ttsAPIKey;
          setValue("sttAPIKey", sttAPIKey, updatedStates.settings.ttl);
          setValue("llmAPIKey", llmAPIKey, updatedStates.settings.ttl);
          setValue("ttsAPIKey", ttsAPIKey, updatedStates.settings.ttl);
        }

        // Save settings to local storage
        const settings = updatedStates.settings;
        setValue("sttProvider", settings.sttProvider, -1);
        setValue("llmProvider", settings.llmProvider);
        setValue("ttsProvider", settings.ttsProvider);
        setValue("sttModel", settings.sttModel);
        setValue("llmModel", settings.llmModel);
        setValue("ttsModel", settings.ttsModel);
        setValue("isUsePassword", settings.isUsePassword);
        setValue("isPasswordSet", settings.isPasswordSet);
        setValue("ttl", settings.ttl);
      } else {
        // Reset all settings
        setValue("sttProvider", undefined);
        setValue("llmProvider", undefined);
        setValue("ttsProvider", undefined);
        setValue("sttModel", undefined);
        setValue("llmModel", undefined);
        setValue("ttsModel", undefined);
        setValue("sttAPIKey", undefined);
        setValue("llmAPIKey", undefined);
        setValue("ttsAPIKey", undefined);
        setValue("isUsePassword", undefined);
        setValue("isPasswordSet", undefined);
        setValue("ttl", undefined);
      }

      context.setMenuStates(updatedStates);
    }
  }

  return {
    menuStates: context?.menuStates,
    updateMenuStates,
  };
}
