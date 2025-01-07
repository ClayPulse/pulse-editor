import { Folder, OpenFileDialogConfig } from "../types";
export abstract class AbstractPlatformAPI {

  // Dialogs
  abstract showOpenFileDialog(config?: OpenFileDialogConfig): Promise<File[]>;

  abstract openFolder(uri: string): Promise<Folder | undefined>;
  abstract saveFolder(folder: Folder, uriPrefix: string): Promise<void>;
  abstract openFile(uri: string): Promise<File | undefined>;
  abstract saveFile(file: File, uri: string): Promise<void>;
}
