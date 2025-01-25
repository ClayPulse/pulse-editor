import {
  FileSystemObject,
  ListPathOptions,
  PersistentSettings,
  ProjectInfo,
} from "@/lib/types";
import { AbstractPlatformAPI } from "../abstract-platform-api";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { FilePicker } from "@capawesome/capacitor-file-picker";

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

  /* This is not implemented on Android because files not written by this app cannot be read. */
  async selectDir(): Promise<string | undefined> {
    throw new Error("Method not implemented.");
  }

  async selectFile(fileExtension?: string): Promise<File> {
    const files = await FilePicker.pickFiles({
      limit: 1,
      types: [fileExtension ? "application/" + fileExtension : "*/*"],
      readData: true,
    });

    const fileObj = files.files[0];
    if (!fileObj) {
      throw new Error("No file selected");
    } else if (!fileObj.data) {
      throw new Error("File data is empty");
    }

    const base64 = fileObj.data;
    const data = atob(base64);

    return new File(
      [new Blob([new Uint8Array(data.split("").map((c) => c.charCodeAt(0)))])],
      fileObj.name,
    );
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

    const pathDir = this.getPathAndDir(uri);

    const files = await Filesystem.readdir({
      path: pathDir.path,
      directory: pathDir.directory,
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
    const pathDir = this.getPathAndDir(uri);
    await Filesystem.mkdir({
      path: pathDir.path,
      directory: pathDir.directory,
    });
  }

  async createFolder(uri: string): Promise<void> {
    console.log("Creating folder at", uri);
    const pathDir = this.getPathAndDir(uri);
    await Filesystem.mkdir({
      path: pathDir.path,
      directory: pathDir.directory,
    });
  }

  async createFile(uri: string): Promise<void> {
    console.log("Creating file at", uri);
    const pathDir = this.getPathAndDir(uri);
    await Filesystem.writeFile({
      path: pathDir.path,
      data: "",
      encoding: Encoding.UTF8,
      directory: pathDir.directory,
    });
  }

  async rename(oldUri: string, newUri: string): Promise<void> {
    const oldPathDir = this.getPathAndDir(oldUri);
    const newPathDir = this.getPathAndDir(newUri);
    await Filesystem.rename({
      from: oldPathDir.path,
      to: newPathDir.path,
      directory: oldPathDir.directory,
      toDirectory: newPathDir.directory,
    });
  }

  async delete(uri: string): Promise<void> {
    // Check if it's a file or a directory
    const pathDir = this.getPathAndDir(uri);

    const file = await Filesystem.stat({
      path: pathDir.path,
      directory: pathDir.directory,
    });

    if (file.type === "directory") {
      await Filesystem.rmdir({
        path: pathDir.path,
        directory: pathDir.directory,
        recursive: true,
      });
    } else if (file.type === "file") {
      await Filesystem.deleteFile({
        path: pathDir.path,
        directory: pathDir.directory,
      });
    }
  }

  async hasPath(uri: string): Promise<boolean> {
    try {
      const pathDir = this.getPathAndDir(uri);
      await Filesystem.stat({
        path: pathDir.path,
        directory: pathDir.directory,
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  async readFile(uri: string): Promise<File> {
    const pathDir = this.getPathAndDir(uri);
    const res = await Filesystem.readFile({
      path: pathDir.path,
      directory: pathDir.directory,
      encoding: Encoding.UTF8,
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
      const pathDir = this.getPathAndDir(uri);
      await Filesystem.writeFile({
        path: pathDir.path,
        directory: pathDir.directory,
        data: await file.text(),
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
    return "";
  }

  async copyFiles(from: string, to: string): Promise<void> {
    const oldPathDir = this.getPathAndDir(from);
    const newPathDir = this.getPathAndDir(to);
    await Filesystem.copy({
      from: oldPathDir.path,
      to: newPathDir.path,
      directory: oldPathDir.directory,
      toDirectory: newPathDir.directory,
    });
  }

  private getPathAndDir(uri: string): {
    path: string;
    directory: Directory;
  } {
    if (uri.startsWith("/")) {
      return {
        path: uri,
        directory: Directory.Data,
      };
    }

    // "content://com.android.externalstorage.documents/tree/primary%3Adist"
    return {
      path:
        "/" +
        uri.replace(
          "content://com.android.externalstorage.documents/tree/primary%3A",
          "",
        ),
      directory: Directory.ExternalStorage,
    };
  }
}
