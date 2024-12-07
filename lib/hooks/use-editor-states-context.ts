import { useContext } from "react";
import { EditorStates, EditorStatesContextType } from "../types";
import { EditorStatesContext } from "@/components/providers/editor-states-provider";
import usePersistSettings from "./use-persist-settings";

export default function useEditorStatesContext() {
  const context: EditorStatesContextType | undefined =
    useContext(EditorStatesContext);

  const { setPersistSettings, clearPersistSettings } = usePersistSettings();

  function updateEditorStates(newEditorStates: Partial<EditorStates>) {
    if (context) {
      context.setEditorStates((prev) => {
        const updatedStates = { ...prev, ...newEditorStates };

        // For persist settings, update or clear settings
        if (updatedStates.settings) {
          // Save settings to local storage
          setPersistSettings(updatedStates.settings);
        } else {
          // Clear settings from local storage
          clearPersistSettings();
        }

        return updatedStates;
      });
    }
  }

  return {
    editorStates: context?.editorStates,
    updateEditorStates: updateEditorStates,
  };
}
