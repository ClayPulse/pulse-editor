import {
  OpenFileDialogConfig,
  Folder,
} from "@/lib/types";
import { AbstractPlatformAPI } from "../abstract-platform-api";

export class WebAPI extends AbstractPlatformAPI {
  constructor() {
    super();
  }

  async showOpenFileDialog(config?: OpenFileDialogConfig): Promise<File[]> {
    return new Promise((resolve, reject) => {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.style.display = "none";
      fileInput.multiple = true;

      if (config?.isFolder) {
        fileInput.setAttribute("webkitdirectory", "");
      }

      // Update paths when files are selected
      fileInput.addEventListener("change", () => {
        const fileList = fileInput.files;
        if (fileList) {
          const files = Array.from(fileList);
          resolve(files);
        } else {
          reject(new Error("No files selected"));
        }
      });

      // Open file picker
      fileInput.click();
    });
  }

  // Reserved for cloud environment implementation
  async openFolder(uri: string): Promise<Folder | undefined> {
    throw new Error("Method not implemented.");
  }
  async saveFolder(folder: Folder, uriPrefix: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async openFile(uri: string): Promise<File | undefined> {
    throw new Error("Method not implemented.");
  }
  async saveFile(file: File, uri: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
