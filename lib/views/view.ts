import { ViewDocument, ViewRef } from "../types";
import { ViewTypeEnum } from "./available-views";

export class View {
  type: ViewTypeEnum;
  viewDocument: ViewDocument;
  isActive: boolean;
  // Bind the view reference when the view is mounted
  viewRef?: ViewRef;
  onChange?: (viewDocument: ViewDocument) => void;

  constructor(type: ViewTypeEnum, viewDocument: ViewDocument) {
    this.type = type;
    this.viewDocument = viewDocument;
    this.isActive = false;
  }

  public setViewRef(viewRef: ViewRef) {
    this.viewRef = viewRef;
  }

  public updateViewDocument(viewDocument: Partial<ViewDocument>) {
    // Notify view component to update the view document
    if (this.viewRef) {
      this.viewRef.updateViewDocument(viewDocument);
    }
  }

  public setViewDocumentChangeCallback(
    callback?: (viewDocument: ViewDocument) => void,
  ) {
    this.onChange = callback;
  }
}
