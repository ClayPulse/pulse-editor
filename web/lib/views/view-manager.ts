import { ViewTypeEnum } from "./available-views";
import { View } from "./view";

export class ViewManager {
  private views: View[];
  // TODO: Use layout array to split the view area into multiple sections
  // layout: View[][][];

  constructor() {
    this.views = [];
  }

  static copy(viewManager: ViewManager | undefined): ViewManager | undefined {
    if (!viewManager) {
      return undefined;
    }
    const newViewManager = new ViewManager();
    viewManager.views.forEach((view) => {
      newViewManager.addView(view);
    });

    return newViewManager;
  }

  public addView(view: View) {
    this.views.push(view);
  }

  public getViewByDocName(docPath: string): View | undefined {
    return this.views.find((view) => view.viewDocument.filePath === docPath);
  }

  public getViewByType(viewType: ViewTypeEnum): View[] {
    const views: View[] = [];
    this.views.forEach((view) => {
      if (view.type === viewType) {
        views.push(view);
      }
    });

    return views;
  }

  public deleteView(view: View) {
    const index = this.views.indexOf(view);
    if (index > -1) {
      this.views.splice(index, 1);
    }
  }

  public clearView() {
    this.views = [];
  }

  public viewCount(): number {
    return this.views.length;
  }

  // TODO: Set view active based on layout
  public setActiveView(view: View) {
    // Set all other views to inactive except the view
    this.views.forEach((v) => {
      if (v === view) {
        v.isActive = true;
      } else {
        v.isActive = false;
      }
    });
  }

  public getActiveView(): View | undefined {
    return this.views.find((view) => view.isActive);
  }
}
