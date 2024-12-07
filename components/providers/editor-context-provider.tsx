"use client";

import usePersistSettings from "@/lib/hooks/use-persist-settings";
import {
  EditorStates,
  EditorContextType,
  PersistSettings,
  ViewRef,
} from "@/lib/types";
import { createContext, useEffect, useRef, useState } from "react";

export const EditorContext = createContext<EditorContextType | undefined>(
  undefined,
);

const defaultEditorStates: EditorStates = {
  isDrawing: false,
  isDrawHulls: true,
  isDownloadClip: false,
  isInlineChat: false,
  isOpenChatView: false,
  isRecording: false,
  isListening: false,
  isThinking: false,
  isSpeaking: false,
  isMuted: false,
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
  const viewMap = useRef<Map<string, ViewRef>>(new Map());
  function addView(viewId: string, view: ViewRef) {
    viewMap.current.set(viewId, view);
  }

  function getViewById(viewId: string) {
    return viewMap.current.get(viewId);
  }

  function getViewByType(viewType: string) {
    const views: ViewRef[] = [];
    viewMap.current.forEach((view) => {
      if (view?.getType() === viewType) {
        views.push(view);
      }
    });

    return views;
  }

  function deleteView(viewId: string) {
    viewMap.current.delete(viewId);
  }

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

  return (
    <EditorContext.Provider
      value={{
        editorStates,
        setEditorStates,
        persistSettings: settings,
        setPersistSettings: setSettings,
        addView,
        getViewById,
        getViewByType,
        deleteView,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}
