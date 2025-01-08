import { FileSystemObject, OpenFileDialogConfig } from "@/lib/types";
import { AbstractPlatformAPI } from "../abstract-platform-api";
import toast from "react-hot-toast";

export class WebAPI extends AbstractPlatformAPI {
  constructor() {
    super();
  }

  async selectPath(): Promise<string | undefined> {
    toast.error("Not implemented");
    throw new Error("Method not implemented.");
  }

  async listPathFolders(uri: string): Promise<string[]> {
    toast.error("Not implemented");
    throw new Error("Method not implemented.");
  }

  // Reserved for cloud environment implementation
  async openProject(uri: string): Promise<FileSystemObject | undefined> {
    throw new Error("Method not implemented.");
  }
  async openFile(uri: string): Promise<File | undefined> {
    throw new Error("Method not implemented.");
  }
  async saveFile(file: File, uri: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
