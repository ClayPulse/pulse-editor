"use client";

import usePersistSettings from "@/lib/hooks/use-persist-settings";
import {
  EditorStates,
  EditorStatesContextType,
  PersistSettings,
} from "@/lib/types";
import { createContext, useEffect, useState } from "react";

export const EditorStatesContext = createContext<
  EditorStatesContextType | undefined
>(undefined);

export default function EditorStatesProvider({
  children,
  defaultEditorStates,
}: {
  children: React.ReactNode;
  defaultEditorStates: EditorStates;
}) {
  const [editorStates, setEditorStates] =
    useState<EditorStates>(defaultEditorStates);

  const { getPersistSettings } = usePersistSettings();

  useEffect(() => {
    const loadedSettings: PersistSettings = getPersistSettings();

    setEditorStates((prev) => ({
      ...prev,
      settings: loadedSettings,
    }));
  }, []);

  return (
    <EditorStatesContext.Provider value={{ editorStates, setEditorStates }}>
      {children}
    </EditorStatesContext.Provider>
  );
}
