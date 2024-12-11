"use client";

import { useEffect, useRef, useState } from "react";
import { Folder } from "@/lib/types";
import { getPlatform } from "../platform-api/platform-checker";
import { PlatformEnum } from "../platform-api/available-platforms";
import { CapacitorAPI } from "../platform-api/capacitor/capacitor-api";
import { AbstractPlatformAPI } from "../platform-api/abstract-platform-api";
import { ElectronAPI } from "../platform-api/electron/electron-api";
import { WebAPI } from "../platform-api/web/web-api";

export function useFileSystem() {
  const [projectPath, setProjectPath] = useState<string | undefined>(undefined);

  const platformApi = useRef<AbstractPlatformAPI | undefined>(undefined);

  useEffect(() => {
    const platform = getPlatform();
    if (platform === PlatformEnum.Capacitor) {
      platformApi.current = new CapacitorAPI();
    } else if (platform === PlatformEnum.Electron) {
      platformApi.current = new ElectronAPI();
    } else if (platform === PlatformEnum.Web) {
      platformApi.current = new WebAPI();
    } else if (platform === PlatformEnum.VSCode) {
      // platformApi.current = new VSCodeAPI();
      throw new Error("VSCode API not implemented");
    } else {
      throw new Error("Unknown platform");
    }
  }, []);

  async function openFilePicker(isFolder: boolean): Promise<string[]> {
    if (platformApi.current === undefined) {
      throw new Error("Platform API not initialized");
    }

    return await platformApi.current.openFilePicker(isFolder);
  }

  async function openFolder(uri: string): Promise<Folder> {
    if (platformApi.current === undefined) {
      throw new Error("Platform API not initialized");
    }

    return await platformApi.current.openFolder(uri);
  }

  async function saveFolder(folder: Folder, uriPrefix: string) {
    if (platformApi.current === undefined) {
      throw new Error("Platform API not initialized");
    }

    platformApi.current.saveFolder(folder, uriPrefix);
  }

  async function readFile(uri: string): Promise<File> {
    if (platformApi.current === undefined) {
      throw new Error("Platform API not initialized");
    }

    return platformApi.current.readFile(uri);
  }

  async function writeFile(file: File, uri: string) {
    if (platformApi.current === undefined) {
      throw new Error("Platform API not initialized");
    }

    platformApi.current.writeFile(file, uri);
  }

  return {
    projectPath,
    openFilePicker,
    openFolder,
    saveFolder,
    readFile,
    writeFile,
  };
}
