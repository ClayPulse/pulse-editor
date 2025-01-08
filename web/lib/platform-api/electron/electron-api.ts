import { FileSystemObject, OpenFileDialogConfig } from "@/lib/types";
import { AbstractPlatformAPI } from "../abstract-platform-api";

export class ElectronAPI extends AbstractPlatformAPI {
  electronAPI: any;
  constructor() {
    super();
    // @ts-expect-error window.electronAPI is exposed by the Electron main process
    this.electronAPI = window.electronAPI;
  }

  async selectPath(): Promise<string | undefined> {
    return await this.electronAPI.selectPath();
  }

  async listPathFolders(uri: string): Promise<string[]> {
    return await this.electronAPI.listPathFolders(uri);
  }

  async openProject(uri: string): Promise<FileSystemObject | undefined> {
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
