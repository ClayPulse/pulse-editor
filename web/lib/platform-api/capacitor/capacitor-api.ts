import {
  OpenFileDialogConfig as OpenFileDialogConfig,
  Folder,
} from "@/lib/types";
import { AbstractPlatformAPI } from "../abstract-platform-api";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { FilePicker } from "@capawesome/capacitor-file-picker";

export class CapacitorAPI extends AbstractPlatformAPI {
  defaultDirectory: Directory;
  defaultFolder: string;
  constructor() {
    super();
    this.defaultDirectory = Directory.Documents;
    this.defaultFolder = "pulse-editor";
  }

  async showOpenFileDialog(config?: OpenFileDialogConfig): Promise<File[]> {
    const hasPermission = await Filesystem.requestPermissions();
    if (hasPermission.publicStorage !== "granted") {
      return [];
    }

    if (config?.isFolder) {
      const result = await FilePicker.pickDirectory();
      const path = result.path;

      const files = await Filesystem.readdir({
        path,
        directory: this.defaultDirectory,
      });

      const filePromises = files.files.map(async (file) => {
        const data = await Filesystem.readFile({
          path: file.uri,
          directory: this.defaultDirectory,
        });
        return new File([data.data], file.uri);
      });

      return await Promise.all(filePromises);
    } else {
      const files = await FilePicker.pickFiles();

      const filePromises = files.files.map(async (file) => {
        const data = await Filesystem.readFile({
          path: file.path!,
          encoding: Encoding.UTF8,
        });
        return new File([data.data], file.path!);
      });

      return await Promise.all(filePromises);
    }
    // return new Promise((resolve, reject) => {
    //   const fileInput = document.createElement("input");
    //   fileInput.type = "file";
    //   fileInput.style.display = "none";
    //   fileInput.multiple = true;

    //   // Update paths when files are selected
    //   fileInput.addEventListener("change", () => {
    //     const fileList = fileInput.files;
    //     if (fileList) {
    //       const files = Array.from(fileList);
    //       resolve(files);
    //     } else {
    //       reject(new Error("No files selected"));
    //     }
    //   });

    //   // Open file picker
    //   fileInput.click();
    // });
  }

  async openFolder(uri: string): Promise<Folder | undefined> {
    throw new Error("Method not implemented.");
  }
  async saveFolder(folder: Folder, uriPrefix: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async openFile(uri: string): Promise<File | undefined> {
    throw new Error("Method not implemented.");
  }

  /**
   * Write a file to the file system. On mobile, this will write to Pulse Editor's
   * default directory.
   * @param file
   * @param uri
   */
  async saveFile(file: File, uri: string): Promise<void> {
    try {
      await Filesystem.writeFile({
        path: this.defaultFolder + "/" + uri,
        data: file,
        directory: this.defaultDirectory,
        encoding: Encoding.UTF8,
      });
    } catch (e) {
      console.error("Error writing file", e);
    }
  }
}
