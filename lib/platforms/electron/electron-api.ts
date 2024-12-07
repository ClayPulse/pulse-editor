import { Folder } from "@/lib/types";
import { AbstractPlatformAPI } from "../abstract-platform-api";

export class ElectronAPI extends AbstractPlatformAPI {
  electronAPI: any;
  constructor() {
    super();
    // @ts-expect-error window.electronAPI is exposed by the Electron main process
    this.electronAPI = window.electronAPI;
  }

  async openFilePicker(isFolder: boolean): Promise<string[]> {
    // Open a file dialogue and return the selected folder
    const paths: string[] = await this.electronAPI.openFilePicker(isFolder);
    return paths;
  }
  async openFolder(uri: string): Promise<Folder> {
    throw new Error("Method not implemented.");
  }
  async saveFolder(folder: Folder, uriPrefix: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async readFile(uri: string): Promise<File> {
    const data: string = await this.electronAPI.readFile(uri);
    const file = new File([data], uri);
    return file;
  }
  async writeFile(file: File, uri: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
