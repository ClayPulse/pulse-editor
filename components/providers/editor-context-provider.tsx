"use client";

import { AIModelConfig } from "@/lib/ai-model-config";
import usePersistSettings from "@/lib/hooks/use-persist-settings";
import { BaseLLM, getModelLLM } from "@/lib/llm/llm";
import { BaseSTT, getModelSTT } from "@/lib/stt/stt";
import { BaseTTS, getModelTTS } from "@/lib/tts/tts";
import { EditorStates, EditorContextType, PersistSettings } from "@/lib/types";
import { ViewManager } from "@/lib/views/view-manager";
import { createContext, useEffect, useRef, useState } from "react";

export const EditorContext = createContext<EditorContextType | undefined>(
  undefined,
);

const defaultEditorStates: EditorStates = {
  isDrawing: false,
  isDrawHulls: true,
  isDownloadClip: false,
  isInlineChatEnabled: false,
  isChatViewOpen: false,
  isRecording: false,
  isListening: false,
  isThinking: false,
  isSpeaking: false,
  isMuted: false,
  isToolbarOpen: true,
};

export default function EditorContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // --- Editor States ---
  const [editorStates, setEditorStates] =
    useState<EditorStates>(defaultEditorStates);

  // --- Persist Settings ---
  // Persist settings are loaded from local storage upon component mount
  const { getPersistSettings, setPersistSettings, clearPersistSettings } =
    usePersistSettings();
  const [settings, setSettings] = useState<PersistSettings | undefined>(
    undefined,
  );
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

  // --- View Management ---
  const [viewManager, setViewManager] = useState<ViewManager | undefined>(
    undefined,
  );

  // --- AI Model Management ---
  const aiModelConfig = useRef<AIModelConfig>(new AIModelConfig());

  // Load settings from local storage
  useEffect(() => {
    getPersistSettings().then((loadedSettings: PersistSettings) => {
      setSettings(loadedSettings);
      setIsSettingsLoaded(true);
    });
  }, []);

  // Save settings to local storage
  useEffect(() => {
    if (isSettingsLoaded) {
      if (settings) {
        setPersistSettings(settings);
      } else {
        clearPersistSettings();
      }
    }
  }, [settings]);

  // Load STT
  useEffect(() => {
    if (settings?.sttAPIKey && settings?.sttProvider && settings?.sttModel) {
      const model = getModelSTT(
        settings?.sttAPIKey,
        settings?.sttProvider,
        settings?.sttModel,
      );
      aiModelConfig.current.setSTTModel(model);
    }
  }, [settings?.sttAPIKey, settings?.sttProvider, settings?.sttModel]);

  // Load LLM
  useEffect(() => {
    if (settings?.llmAPIKey && settings?.llmProvider && settings?.llmModel) {
      const model = getModelLLM(
        settings?.llmAPIKey,
        settings?.llmProvider,
        settings?.llmModel,
        0.85,
      );
      aiModelConfig.current.setLLMModel(model);
    }
  }, [settings?.llmAPIKey, settings?.llmProvider, settings?.llmModel]);

  // Load TTS
  useEffect(() => {
    if (
      settings?.ttsAPIKey &&
      settings?.ttsProvider &&
      settings?.ttsModel &&
      settings?.ttsVoice
    ) {
      const model = getModelTTS(
        settings?.ttsAPIKey,
        settings?.ttsProvider,
        settings?.ttsModel,
        settings?.ttsVoice,
      );
      aiModelConfig.current.setTTSModel(model);
    }
  }, [
    settings?.ttsAPIKey,
    settings?.ttsProvider,
    settings?.ttsModel,
    settings?.ttsVoice,
  ]);

  return (
    <EditorContext.Provider
      value={{
        editorStates,
        setEditorStates,
        persistSettings: settings,
        setPersistSettings: setSettings,
        viewManager,
        setViewManager,
        aiModelConfig: aiModelConfig.current,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}
