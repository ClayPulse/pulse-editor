import { useContext } from "react";
import { ViewDocument } from "../types";
import { EditorContext } from "@/components/providers/editor-context-provider";
import { View } from "../views/view";
import { ViewTypeEnum } from "../views/available-views";
import { ViewManager } from "../views/view-manager";

export function useViewManager() {
  const editorContext = useContext(EditorContext);

  function openDocumentInView(doc: ViewDocument) {
    const view = new View(ViewTypeEnum.Code, doc);
    // Notify state update by setting a modified copy of the view manager
    editorContext?.setViewManager((prev) => {
      const newVM = ViewManager.copy(prev);
      newVM?.clearViews();
      // Add view to view manager
      newVM?.addView(view);
      // Set the view as active
      newVM?.setActiveView(view);
      return newVM;
    });
  }

  function closeDocumentInView(uri: string) {
    editorContext?.setViewManager((prev) => {
      const newVM = ViewManager.copy(prev);
      const view = newVM?.getViewByDocName(uri);
      if (view) {
        newVM?.deleteView(view);
      }
      return newVM;
    });
  }

  function clearViews() {
    editorContext?.setViewManager((prev) => {
      const newVM = ViewManager.copy(prev);
      newVM?.clearViews();
      return newVM;
    });
  }

  return {
    openDocumentInView,
    closeDocumentInView,
    clearViews,
  };
}
