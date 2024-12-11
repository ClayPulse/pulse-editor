import { Folder } from "@/lib/types";
import { AbstractPlatformAPI } from "../abstract-platform-api";

export class WebAPI extends AbstractPlatformAPI {
  constructor() {
    super();
  }

  async openFolder(): Promise<Folder | undefined> {
    throw new Error("Method not implemented.");
  }
  async saveFolder(folder: Folder, uriPrefix: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async openFile(): Promise<File | undefined> {
    const files = await this.openFilePicker(false);
    if (files.length === 0) {
      return undefined;
    }
    return files[0];
  }
  async writeFile(file: File, uri: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  private async openFilePicker(isFolder: boolean): Promise<File[]> {
    return new Promise((resolve, reject) => {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.style.display = "none";
      fileInput.multiple = true;

      if (isFolder) {
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
}
