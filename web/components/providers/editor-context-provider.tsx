"use client";

import { AIModelConfig } from "@/lib/ai-model-config";
import { usePlatformApi } from "@/lib/hooks/use-platform-api";
import { getModelLLM } from "@/lib/llm/llm";
import { getModelSTT } from "@/lib/stt/stt";
import { getModelTTS } from "@/lib/tts/tts";
import {
  EditorStates,
  EditorContextType,
  PersistentSettings,
} from "@/lib/types";
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
  explorerSelectedNodeRefs: [],
  pressedKeys: [],
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
  const [settings, setSettings] = useState<PersistentSettings | undefined>(
    undefined,
  );
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

  // --- View Management ---
  const [viewManager, setViewManager] = useState<ViewManager | undefined>(
    undefined,
  );

  // --- AI Model Management ---
  const aiModelConfig = useRef<AIModelConfig>(new AIModelConfig());

  // --- Platform API ---
  const { platformApi } = usePlatformApi();

  // Track all pressed keys
  useEffect(() => {
    window.addEventListener("keydown", (e) => {
      setEditorStates((prev) => {
        // Prevent duplicate keys
        if (!prev.pressedKeys.includes(e.key)) {
          return {
            ...prev,
            pressedKeys: [...prev.pressedKeys, e.key],
          };
        }

        return prev;
      });
    });

    window.addEventListener("keyup", (e) => {
      setEditorStates((prev) => ({
        ...prev,
        pressedKeys: prev.pressedKeys.filter((key) => key !== e.key),
      }));
    });

    return () => {
      window.removeEventListener("keydown", () => {});
      window.removeEventListener("keyup", () => {});
    };
  }, []);

  // Load settings from local storage
  useEffect(() => {
    if (platformApi) {
      platformApi
        ?.getPersistentSettings()
        .then((loadedSettings: PersistentSettings) => {
          setSettings(loadedSettings);
          setIsSettingsLoaded(true);
        });
    }
  }, [platformApi]);

  // Init extension folder
  useEffect(() => {
    if (platformApi) {
      // Create the extensions folder if it doesn't exist
      platformApi.getInstallationPath().then((path) => {
        const extensionsPath = path + "/extensions";
        platformApi.hasFile(extensionsPath).then((exists) => {
          if (!exists) {
            platformApi.createFolder(extensionsPath);
          }
        });
      });
    }
  }, [platformApi]);

  // Save settings to local storage
  useEffect(() => {
    if (isSettingsLoaded) {
      if (settings) {
        platformApi?.setPersistentSettings(settings);
      } else {
        platformApi?.resetPersistentSettings();
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
