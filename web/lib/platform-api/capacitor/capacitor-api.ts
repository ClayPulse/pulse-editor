import { FileSystemObject } from "@/lib/types";
import { AbstractPlatformAPI } from "../abstract-platform-api";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { FilePicker } from "@capawesome/capacitor-file-picker";

export class CapacitorAPI extends AbstractPlatformAPI {
  constructor() {
    super();
  }

  async selectPath(): Promise<string | undefined> {
    const result = await FilePicker.pickDirectory();
    const uri = decodeURIComponent(result.path).replace(
      "content://com.android.externalstorage.documents/tree/primary:",
      "/",
    );
    return uri;
  }

  async listPathFolders(uri: string): Promise<string[]> {
    const files = await Filesystem.readdir({
      path: uri,
      directory: Directory.ExternalStorage,
    });

    const folders = files.files
      .filter((file) => file.type === "directory")
      .map((file) => file.name);

    return folders;
  }

  async openProject(uri: string): Promise<FileSystemObject | undefined> {
    throw new Error("Method not implemented.");
  }
  async openFile(uri: string): Promise<File | undefined> {
    throw new Error("Method not implemented.");
  }

  /**
   * Write a file to the file system. On mobile, this will write to Pulse Editor's
   * default directory.
   * @param file
   * @param uri
   */
  async saveFile(file: File, uri: string): Promise<void> {
    try {
      await Filesystem.writeFile({
        path: uri,
        data: file,
        encoding: Encoding.UTF8,
      });
    } catch (e) {
      console.error("Error writing file", e);
    }
  }
}
