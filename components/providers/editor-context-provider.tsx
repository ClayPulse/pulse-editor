"use client";

import usePersistSettings from "@/lib/hooks/use-persist-settings";
import { EditorStates, EditorContextType, PersistSettings } from "@/lib/types";
import { createContext, useEffect, useState } from "react";

export const EditorContext = createContext<EditorContextType | undefined>(
  undefined,
);

export default function EditorContextProvider({
  children,
  defaultEditorStates,
}: {
  children: React.ReactNode;
  defaultEditorStates: EditorStates;
}) {
  const [editorStates, setEditorStates] =
    useState<EditorStates>(defaultEditorStates);

  const { getPersistSettings, setPersistSettings, clearPersistSettings } =
    usePersistSettings();
  const [settings, setSettings] = useState<PersistSettings | undefined>(
    undefined,
  );
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

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
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}
