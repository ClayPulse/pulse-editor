import { FileSystemObject, PersistentSettings, ProjectInfo } from "../types";

export abstract class AbstractPlatformAPI {
  // Show a selection dialogue
  abstract selectPath(): Promise<string | undefined>;
  // List all projects in a path
  abstract listPathProjects(uri: string): Promise<ProjectInfo[]>;
  // Discover project content
  abstract discoverProjectContent(uri: string): Promise<FileSystemObject[]>;
  // Create project
  abstract createProject(uri: string): Promise<void>;

  // abstract saveFolder(folder: Folder, uriPrefix: string): Promise<void>;
  abstract openFile(uri: string): Promise<File | undefined>;
  abstract saveFile(file: File, uri: string): Promise<void>;

  // Persistent settings
  abstract getPersistentSettings(): Promise<PersistentSettings>;
  abstract setPersistentSettings(settings: PersistentSettings): Promise<void>;
  abstract resetPersistentSettings(): Promise<void>;
}
