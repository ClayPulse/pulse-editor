import { useContext, useEffect, useState } from "react";
import { FileViewManager } from "../views/file-view-manager";
import { EditorContext } from "@/components/providers/editor-context-provider";

export function useViewManager() {
  const [fileViewManager, setFileViewManager] = useState<
    FileViewManager | undefined
  >(undefined);
  const editorContext = useContext(EditorContext);

  useEffect(() => {
    if (!fileViewManager && editorContext) {
      setFileViewManager(new FileViewManager(editorContext));
    }
  }, [fileViewManager, editorContext]);

  return {
    viewManager: fileViewManager,
  };
}
