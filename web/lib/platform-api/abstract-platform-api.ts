import { OpenFileDialogConfig, Folder, SaveFileDialogConfig } from "../types";

export abstract class AbstractPlatformAPI {
  // Dialogs
  abstract showOpenFileDialog(config?: OpenFileDialogConfig): Promise<File[]>;
  abstract showSaveFileDialog(config?: SaveFileDialogConfig): Promise<string | undefined>;

  abstract openFolder(uri: string): Promise<Folder | undefined>;
  abstract saveFolder(folder: Folder, uriPrefix: string): Promise<void>;
  abstract openFile(uri: string): Promise<File | undefined>;
  abstract writeFile(file: File, uri: string): Promise<void>;
}
