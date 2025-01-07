"use client";

import { useEffect, useRef, useState } from "react";
import {
  OpenFileDialogConfig,
  Folder,
  SaveFileDialogConfig,
} from "@/lib/types";
import { AbstractPlatformAPI } from "../platform-api/abstract-platform-api";
import { getAbstractPlatformAPI } from "../platform-api/get-abstract-platform-api";

export function useFileSystem() {
  const [projectPath, setProjectPath] = useState<string | undefined>(undefined);

  const platformApi = useRef<AbstractPlatformAPI | undefined>(undefined);

  useEffect(() => {
    platformApi.current = getAbstractPlatformAPI();
  }, []);

  async function showOpenFileDialog(
    config?: OpenFileDialogConfig,
  ): Promise<File[]> {
    if (platformApi.current === undefined) {
      throw new Error("Platform API not initialized");
    }

    return await platformApi.current.showOpenFileDialog(config);
  }

  // async function openFolder(uri: string): Promise<Folder | undefined> {
  //   if (platformApi.current === undefined) {
  //     throw new Error("Platform API not initialized");
  //   }

  //   return await platformApi.current.openFolder(uri);
  // }

  // async function saveFolder(folder: Folder, uriPrefix: string) {
  //   if (platformApi.current === undefined) {
  //     throw new Error("Platform API not initialized");
  //   }

  //   platformApi.current.saveFolder(folder, uriPrefix);
  // }

  async function openFile(uri: string): Promise<File | undefined> {
    if (platformApi.current === undefined) {
      throw new Error("Platform API not initialized");
    }

    return platformApi.current.openFile(uri);
  }

  async function writeFile(file: File, uri: string) {
    if (platformApi.current === undefined) {
      throw new Error("Platform API not initialized");
    }

    platformApi.current.saveFile(file, uri);
  }

  return {
    projectPath,
    showOpenFileDialog,
    // openFolder,
    // saveFolder,
    openFile,
    writeFile,
  };
}
