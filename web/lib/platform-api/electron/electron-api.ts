import {
  FileSystemObject,
  OpenFileDialogConfig,
  PersistentSettings,
  ProjectInfo,
} from "@/lib/types";
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

  async listPathProjects(uri: string): Promise<ProjectInfo[]> {
    return await this.electronAPI.listPathProjects(uri);
  }

  async discoverProjectContent(uri: string): Promise<FileSystemObject[]> {
    return await this.electronAPI.discoverProjectContent(uri);
  }

  async createProject(uri: string): Promise<void> {
    await this.electronAPI.createProject(uri);
  }

  async updateProject(oldUri: string, newUri: string): Promise<void> {
    await this.electronAPI.updateProject(oldUri, newUri);
  }

  async createFolder(uri: string): Promise<void> {
    await this.electronAPI.createFolder(uri);
  }

  async createFile(uri: string): Promise<void> {
    await this.electronAPI.createFile(uri);
  }

  async readFile(uri: string): Promise<File> {
    const data = await this.electronAPI.readFile(uri);
    return new File([data], uri);
  }

  /**
   * Write a file to the file system.
   * @param file
   * @param uri
   */
  async writeFile(file: File, uri: string): Promise<void> {
    const data = await file.text();
    await this.electronAPI.writeFile(data, uri);
  }

  async getPersistentSettings(): Promise<PersistentSettings> {
    const persistentSettings: PersistentSettings =
      await this.electronAPI.loadSettings();

    return persistentSettings;
  }

  async setPersistentSettings(settings: PersistentSettings): Promise<void> {
    await this.electronAPI.saveSettings(settings);
  }

  async resetPersistentSettings(): Promise<void> {
    await this.electronAPI.saveSettings({});
  }
}
