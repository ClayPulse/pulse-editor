import { EditorContextType, FileViewModel } from "../types";

export class FileViewManager {
  private editorContext: EditorContextType | undefined;
  // TODO: Use layout array to split the view area into multiple sections
  // layout: View[][][];

  constructor(editorContext: EditorContextType) {
    this.editorContext = editorContext;
  }

  public async openFileView(file: File) {
    const text = await file.text();
    const model: FileViewModel = {
      fileContent: text,
      filePath: file.name,
      isActive: false,
    };

    if (!this.editorContext) {
      throw new Error("Editor context is not available");
    }
    this.editorContext.setEditorStates((prev) => {
      return {
        ...prev,
        openedViewModels: [...prev.openedViewModels, model],
      };
    });
  }

  public getFileViewByFilePath(uri: string): FileViewModel | undefined {
    if (!this.editorContext) {
      throw new Error("Editor context is not available");
    }
    return this.editorContext.editorStates.openedViewModels.find(
      (view) => view.filePath === uri,
    );
  }

  public closeFileView(view: FileViewModel) {
    if (!this.editorContext) {
      throw new Error("Editor context is not available");
    }
    this.editorContext.setEditorStates((prev) => {
      return {
        ...prev,
        openedViewModels: prev.openedViewModels.filter(
          (v) => v.filePath !== view.filePath,
        ),
      };
    });
  }

  public updateFileView(view: Partial<FileViewModel>) {
    if (!this.editorContext) {
      throw new Error("Editor context is not available");
    }

    this.editorContext.setEditorStates((prev) => {
      const updatedViewModels = prev.openedViewModels.map((v) => {
        if (v.filePath === view.filePath) {
          return {
            ...v,
            ...view,
          };
        } else {
          return v;
        }
      });
      return {
        ...prev,
        openedViewModels: updatedViewModels,
      };
    });
  }

  /**
   * Clear all views
   */
  public closeAllFileViews() {
    if (!this.editorContext) {
      throw new Error("Editor context is not available");
    }
    this.editorContext.setEditorStates((prev) => {
      return {
        ...prev,
        openedViewModels: [],
      };
    });
  }

  public fileViewCount(): number {
    if (!this.editorContext) {
      throw new Error("Editor context is not available");
    }
    return this.editorContext.editorStates.openedViewModels.length;
  }

  // TODO: Set view active based on layout
  public setActiveFileView(view: FileViewModel) {
    // Set all other views to inactive except the view
    if (!this.editorContext) {
      throw new Error("Editor context is not available");
    }

    this.editorContext.setEditorStates((prev) => {
      const updatedViewModels = prev.openedViewModels.map((v) => {
        if (v.filePath === view.filePath) {
          return {
            ...v,
            isActive: true,
          };
        } else {
          return {
            ...v,
            isActive: false,
          };
        }
      });
      return {
        ...prev,
        openedViewModels: updatedViewModels,
      };
    });
  }

  public getActiveFileView(): FileViewModel | undefined {
    // return this.viewModels.find((view) => view.isActive);
    if (!this.editorContext) {
      throw new Error("Editor context is not available");
    }
    return this.editorContext.editorStates.openedViewModels.find(
      (view) => view.isActive,
    );
  }
}
