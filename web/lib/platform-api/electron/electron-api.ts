import {
  OpenFileDialogConfig,
  Folder,
  SaveFileDialogConfig,
} from "@/lib/types";
import { AbstractPlatformAPI } from "../abstract-platform-api";

export class ElectronAPI extends AbstractPlatformAPI {
  electronAPI: any;
  constructor() {
    super();
    // @ts-expect-error window.electronAPI is exposed by the Electron main process
    this.electronAPI = window.electronAPI;
  }

  async showOpenFileDialog(config?: OpenFileDialogConfig): Promise<File[]> {
    // Open a file dialogue and return the selected folder
    const paths: string[] = await this.electronAPI.showOpenFileDialog(config);

    if (!paths) {
      return [];
    }

    const files = [];
    for (const path of paths) {
      const data: string = await this.electronAPI.readFile(path);
      const file = new File([data], path);
      files.push(file);
    }

    return files;
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
   * Write a file to the file system.
   * @param file
   * @param uri
   */
  async saveFile(file: File, uri: string): Promise<void> {
    const data = await file.text();
    await this.electronAPI.writeFile(data, uri);
  }
}
