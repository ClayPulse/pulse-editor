import { FileSystemObject, PersistentSettings, ProjectInfo } from "@/lib/types";
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

  async listPathFolders(uri: string): Promise<ProjectInfo[]> {
    const files = await Filesystem.readdir({
      path: uri,
      directory: Directory.ExternalStorage,
    });

    const folders = files.files
      .filter((file) => file.type === "directory")
      .map((file) => ({
        name: file.name,
        ctime: file.ctime ? new Date(file.ctime) : new Date(),
      }));

    return folders;
  }

  async discoverProjectContent(uri: string): Promise<FileSystemObject[]> {
    // Try to get permissions to read the directory
    const permission = await Filesystem.requestPermissions();
    if (permission.publicStorage !== "granted") {
      throw new Error("Permission denied");
    }
    console.log("Permission", permission);

    const files = await Filesystem.readdir({
      path: uri,
      directory: Directory.ExternalStorage,
    });

    console.log("Uri", uri);
    console.log("Files", files);
    const promise = files.files.map(async (file) => {
      if (file.type === "directory") {
        const dirObj: FileSystemObject = {
          name: file.name,
          isFolder: true,
          subDirItems: await this.discoverProjectContent(uri + "/" + file.name),
        };
        return dirObj;
      } else {
        console.log("File", file);
        const fileObj: FileSystemObject = {
          name: file.name,
          isFolder: false,
        };
        return fileObj;
      }
    });

    const fileSystemObjects = await Promise.all(promise);

    return fileSystemObjects;
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

  async getPersistentSettings(): Promise<PersistentSettings> {
    try {
      const res = await Filesystem.readFile({
        path: "settings.json",
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      });

      const settings = JSON.parse(res.data as string);

      return settings;
    } catch (e) {
      return {};
    }
  }

  async setPersistentSettings(settings: PersistentSettings): Promise<void> {
    await Filesystem.writeFile({
      data: JSON.stringify(settings),
      path: "settings.json",
      directory: Directory.Data,
      encoding: Encoding.UTF8,
    });
  }

  async resetPersistentSettings(): Promise<void> {
    await Filesystem.deleteFile({
      path: "settings.json",
      directory: Directory.Data,
    });
  }
}
