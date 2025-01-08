export abstract class AbstractPlatformAPI {
  // Show a selection dialogue
  abstract selectPath(): Promise<string | undefined>;
  // List all folders in a path
  abstract listPathFolders(uri: string): Promise<string[]>;

  // abstract saveFolder(folder: Folder, uriPrefix: string): Promise<void>;
  abstract openFile(uri: string): Promise<File | undefined>;
  abstract saveFile(file: File, uri: string): Promise<void>;
}
