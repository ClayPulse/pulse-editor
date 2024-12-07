import { Folder } from "../types";

export abstract class AbstractPlatformAPI {
  abstract openFilePicker(isFolder: boolean): Promise<string[]>;
  abstract openFolder(uri: string): Promise<Folder>;
  abstract saveFolder(folder: Folder, uriPrefix: string): Promise<void>;
  abstract readFile(uri: string): Promise<File>;
  abstract writeFile(file: File, uri: string): Promise<void>;
}
