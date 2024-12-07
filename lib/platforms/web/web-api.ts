import { Folder } from "@/lib/types";
import { AbstractPlatformAPI } from "../abstract-platform-api";

export class WebAPI extends AbstractPlatformAPI {
  async openFilePicker(isFolder: boolean): Promise<string[]> {
    throw new Error("Method not implemented.");
  }
  async openFolder(uri: string): Promise<Folder> {
    throw new Error("Method not implemented.");
  }
  async saveFolder(folder: Folder, uriPrefix: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async readFile(uri: string): Promise<File> {
    throw new Error("Method not implemented.");
  }
  async writeFile(file: File, uri: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
