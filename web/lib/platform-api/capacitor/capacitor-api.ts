import {
  FileSystemObject,
  ListPathOptions,
  PersistentSettings,
  ProjectInfo,
} from "@/lib/types";
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

  async listProjects(projectHomePath: string): Promise<ProjectInfo[]> {
    const files = await Filesystem.readdir({
      path: projectHomePath,
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

  async listPathContent(
    uri: string,
    options?: ListPathOptions,
  ): Promise<FileSystemObject[]> {
    // Try to get permissions to read the directory
    const permission = await Filesystem.requestPermissions();
    if (permission.publicStorage !== "granted") {
      throw new Error("Permission denied");
    }

    const files = await Filesystem.readdir({
      path: uri,
      directory: Directory.Data,
    });

    const promise = files.files
      .filter(
        (file) =>
          (options?.include === "folders" && file.type === "directory") ||
          (options?.include === "files" && file.type === "file") ||
          options?.include === "all",
      )
      .map(async (file) => {
        const absoluteUri = uri + "/" + file.name;
        if (file.type === "directory") {
          const dirObj: FileSystemObject = {
            name: file.name,
            isFolder: true,
            subDirItems: options?.isRecursive
              ? await this.listPathContent(absoluteUri)
              : [],
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

  async createFolder(uri: string): Promise<void> {
    console.log("Creating folder at", uri);
    await Filesystem.mkdir({
      path: uri,
      directory: Directory.Data,
    });
  }

  async createFile(uri: string): Promise<void> {
    console.log("Creating file at", uri);
    await Filesystem.writeFile({
      path: uri,
      data: "",
      encoding: Encoding.UTF8,
      directory: Directory.Data,
    });
  }

  async rename(oldUri: string, newUri: string): Promise<void> {
    await Filesystem.rename({
      from: oldUri,
      to: newUri,
      directory: Directory.Data,
    });
  }

  async delete(uri: string): Promise<void> {
    // Check if it's a file or a directory
    const file = await Filesystem.stat({
      path: uri,
      directory: Directory.Data,
    });

    if (file.type === "directory") {
      await Filesystem.rmdir({
        path: uri,
        directory: Directory.Data,
        recursive: true,
      });
    } else if (file.type === "file") {
      await Filesystem.deleteFile({
        path: uri,
        directory: Directory.Data,
      });
    }
  }

  async hasFile(uri: string): Promise<boolean> {
    try {
      await Filesystem.stat({
        path: uri,
        directory: Directory.Data,
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  async readFile(uri: string): Promise<File> {
    const res = await Filesystem.readFile({
      path: uri,
      encoding: Encoding.UTF8,
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
        data: await file.text(),
        encoding: Encoding.UTF8,
        directory: Directory.Data,
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

      settings.projectHomePath = "/projects";

      return settings;
    } catch (e) {
      return {
        projectHomePath: "/projects",
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

  async getInstallationPath(): Promise<string> {
    return "/";
  }
}
