import { Dispatch, SetStateAction, useContext } from "react";
import { MenuStates } from "../types";
import { useLocalStorage } from "./use-local-storage";
import { MenuStatesContext } from "@/components/providers/menu-states-context-provider";

export default function useMenuStatesContext() {
  const context:
    | {
        menuStates: MenuStates;
        setMenuStates: Dispatch<SetStateAction<MenuStates>>;
      }
    | undefined = useContext(MenuStatesContext);
  const { getValue, setValue } = useLocalStorage();

  function updateMenuStates(newMenuStates: Partial<MenuStates>) {
    if (context) {
      context.setMenuStates((prev) => {
        const updatedStates = { ...prev, ...newMenuStates };

        if (updatedStates.settings) {
          // Default TTL is set to 14 days
          if (!updatedStates.settings.ttl) {
            updatedStates.settings.ttl = 14 * 24 * 60 * 60 * 1000;
          }
          // Save settings to local storage
          const settings = updatedStates.settings;
          setValue("sttProvider", settings.sttProvider);
          setValue("llmProvider", settings.llmProvider);
          setValue("ttsProvider", settings.ttsProvider);
          setValue("sttModel", settings.sttModel);
          setValue("llmModel", settings.llmModel);
          setValue("ttsModel", settings.ttsModel);
          setValue("isUsePassword", settings.isUsePassword);
          setValue("isPasswordSet", settings.isPasswordSet);
          setValue("ttl", settings.ttl); // 14 days
          setValue("ttsVoice", settings.ttsVoice);

          // Do not allow API token editing after password is set
          if (!updatedStates.settings.isPasswordSet) {
            const sttAPIKey = updatedStates.settings.sttAPIKey;
            const llmAPIKey = updatedStates.settings.llmAPIKey;
            const ttsAPIKey = updatedStates.settings.ttsAPIKey;
            setValue("sttAPIKey", sttAPIKey, updatedStates.settings.ttl);
            setValue("llmAPIKey", llmAPIKey, updatedStates.settings.ttl);
            setValue("ttsAPIKey", ttsAPIKey, updatedStates.settings.ttl);
          }
          // Only update TTL if it is set
          else {
            const encryptedSttAPIKey = getValue<string>("sttAPIKey");
            const encryptedLlmAPIKey = getValue<string>("llmAPIKey");
            const encryptedTtsAPIKey = getValue<string>("ttsAPIKey");
            setValue(
              "sttAPIKey",
              encryptedSttAPIKey,
              updatedStates.settings.ttl,
            );
            setValue(
              "llmAPIKey",
              encryptedLlmAPIKey,
              updatedStates.settings.ttl,
            );
            setValue(
              "ttsAPIKey",
              encryptedTtsAPIKey,
              updatedStates.settings.ttl,
            );
          }
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
          setValue("ttsVoice", undefined);
        }
        return updatedStates;
      });
    }
  }

  return {
    menuStates: context?.menuStates,
    updateMenuStates,
  };
}
