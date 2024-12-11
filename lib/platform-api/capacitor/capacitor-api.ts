import { Folder } from "@/lib/types";
import { AbstractPlatformAPI } from "../abstract-platform-api";
import { Filesystem } from "@capacitor/filesystem";

export class CapacitorAPI extends AbstractPlatformAPI {
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
    const files = await this.openFilePicker();
    if (files.length === 0) {
      return undefined;
    }
    return files[0];
  }
  async writeFile(file: File, uri: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  private async openFilePicker(): Promise<File[]> {
    const hasPermission = await Filesystem.requestPermissions();
    if (hasPermission.publicStorage !== "granted") {
      return [];
    }
    return new Promise((resolve, reject) => {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.style.display = "none";
      fileInput.multiple = true;

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
