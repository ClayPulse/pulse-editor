import { FileSystemObject, PersistentSettings, ProjectInfo } from "../types";

export abstract class AbstractPlatformAPI {
  // Show a selection dialogue
  abstract selectPath(): Promise<string | undefined>;
  // List all folders in a path
  abstract listPathFolders(uri: string): Promise<ProjectInfo[]>;
  // Discover project content
  abstract discoverProjectContent(uri: string): Promise<FileSystemObject[]>;

  // abstract saveFolder(folder: Folder, uriPrefix: string): Promise<void>;
  abstract openFile(uri: string): Promise<File | undefined>;
  abstract saveFile(file: File, uri: string): Promise<void>;

  abstract getPersistentSettings(): Promise<PersistentSettings>;
  abstract setPersistentSettings(settings: PersistentSettings): Promise<void>;
  abstract resetPersistentSettings(): Promise<void>;
}
