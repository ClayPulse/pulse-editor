import { Folder } from "../types";

export abstract class AbstractPlatformAPI {
  abstract openFolder(): Promise<Folder | undefined>;
  abstract saveFolder(folder: Folder, uriPrefix: string): Promise<void>;
  abstract openFile(): Promise<File | undefined>;
  abstract writeFile(file: File, uri: string): Promise<void>;
}
