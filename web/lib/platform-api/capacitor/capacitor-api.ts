import { FileSystemObject, PersistentSettings, ProjectInfo } from "@/lib/types";
import { AbstractPlatformAPI } from "../abstract-platform-api";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";

export class CapacitorAPI extends AbstractPlatformAPI {
  constructor() {
    super();

    // If "projects" directory does not exist, create it

    Filesystem.readdir({
      path: "/projects",
      directory: Directory.Data,
    }).catch((e) => {
      Filesystem.mkdir({
        path: "/projects",
        directory: Directory.Data,
      });
    });
  }

  async selectPath(): Promise<string | undefined> {
    throw new Error("Cannot access external storage on mobile.");
  }

  async listPathProjects(uri: string): Promise<ProjectInfo[]> {
    const files = await Filesystem.readdir({
      path: uri,
      directory: Directory.Data,
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

    const files = await Filesystem.readdir({
      path: uri,
      directory: Directory.Data,
    });

    const promise = files.files.map(async (file) => {
      const absoluteUri = uri + "/" + file.name;
      if (file.type === "directory") {
        const dirObj: FileSystemObject = {
          name: file.name,
          isFolder: true,
          subDirItems: await this.discoverProjectContent(absoluteUri),
          uri: absoluteUri,
        };
        return dirObj;
      } else {
        console.log("File", file);
        const fileObj: FileSystemObject = {
          name: file.name,
          isFolder: false,
          uri: absoluteUri,
        };
        return fileObj;
      }
    });

    const fileSystemObjects = await Promise.all(promise);

    return fileSystemObjects;
  }

  async createProject(uri: string): Promise<void> {
    await Filesystem.mkdir({
      path: uri,
      directory: Directory.Data,
    });
  }

  async readFile(uri: string): Promise<File> {
    const res = await Filesystem.readFile({
      path: uri,
      directory: Directory.Data,
    });

    return new File([res.data as BlobPart], uri);
  }

  /**
   * Write a file to the file system. On mobile, this will write to Pulse Editor's
   * default directory.
   * @param file
   * @param uri
   */
  async writeFile(file: File, uri: string): Promise<void> {
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

      settings.projectHomePath = "projects";

      return settings;
    } catch (e) {
      return {
        projectHomePath: "projects",
      };
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
