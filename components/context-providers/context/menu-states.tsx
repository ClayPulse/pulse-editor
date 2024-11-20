"use client";

import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { MenuStates, Settings } from "@/lib/interface";
import { createContext, useEffect, useState } from "react";

interface MenuStatesContextType {
  menuStates: MenuStates;
  setMenuStates: (newMenuStates: MenuStates) => void;
}

export const MenuStatesContext = createContext<
  MenuStatesContextType | undefined
>(undefined);

export default function MenuStatesContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuStates, setMenuStates] = useState<MenuStates>({
    isDrawingMode: false,
    isDrawHulls: true,
    isDownloadClip: false,
    isRecording: false,
  });

  const { getValue } = useLocalStorage();

  useEffect(() => {
    // Load settings from local storage
    const loadedSettings: Settings = {};

    const STTProvider = getValue<string>("sttProvider");
    const LLMProvider = getValue<string>("llmProvider");
    const TTSProvider = getValue<string>("ttsProvider");
    const STTModel = getValue<string>("sttModel");
    const LLMModel = getValue<string>("llmModel");
    const TTSModel = getValue<string>("ttsModel");
    const STTAPIKey = getValue<string>("sttAPIKey");
    const LLMAPIKey = getValue<string>("llmAPIKey");
    const TTSAPIKey = getValue<string>("ttsAPIKey");
    const isUsePassword = getValue<boolean>("isUsePassword");

    loadedSettings.sttProvider = STTProvider ?? undefined;
    loadedSettings.llmProvider = LLMProvider ?? undefined;
    loadedSettings.ttsProvider = TTSProvider ?? undefined;
    loadedSettings.sttModel = STTModel ?? undefined;
    loadedSettings.llmModel = LLMModel ?? undefined;
    loadedSettings.ttsModel = TTSModel ?? undefined;
    loadedSettings.sttAPIKey = STTAPIKey ?? undefined;
    loadedSettings.llmAPIKey = LLMAPIKey ?? undefined;
    loadedSettings.ttsAPIKey = TTSAPIKey ?? undefined;
    loadedSettings.isUsePassword = isUsePassword ?? undefined;

    setMenuStates((prev) => ({
      ...prev,
      settings: loadedSettings,
    }));
  }, []);

  return (
    <MenuStatesContext.Provider value={{ menuStates, setMenuStates }}>
      {children}
    </MenuStatesContext.Provider>
  );
}
