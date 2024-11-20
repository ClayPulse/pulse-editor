import { useContext, useEffect, useState } from "react";
import { MenuStates, Settings } from "../interface";
import { useLocalStorage } from "./use-local-storage";
import { MenuStatesContext } from "@/components/context-providers/context/menu-states";

export default function useMenuStatesContext() {
  const context:
    | {
        menuStates: MenuStates;
        setMenuStates: (newMenuStates: MenuStates) => void;
      }
    | undefined = useContext(MenuStatesContext);
  const { setValue } = useLocalStorage();

  function updateMenuStates(newMenuStates: Partial<MenuStates>) {
    if (context) {
      context.setMenuStates({
        ...context.menuStates,
        ...newMenuStates,
      });

      // Save settings to local storage
      if (newMenuStates.settings) {
        const settings = newMenuStates.settings;
        setValue("sttProvider", settings.sttProvider);
        setValue("llmProvider", settings.llmProvider);
        setValue("ttsProvider", settings.ttsProvider);
        setValue("sttModel", settings.sttModel);
        setValue("llmModel", settings.llmModel);
        setValue("ttsModel", settings.ttsModel);
        setValue("sttAPIKey", settings.sttAPIKey);
        setValue("llmAPIKey", settings.llmAPIKey);
        setValue("ttsAPIKey", settings.ttsAPIKey);
        setValue("isUsePassword", settings.isUsePassword);
      }
    }
  }

  return {
    menuStates: context?.menuStates,
    updateMenuStates,
  };
}
