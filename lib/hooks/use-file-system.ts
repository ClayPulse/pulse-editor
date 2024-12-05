"use client";

import { useState } from "react";
import { Folder } from "@/lib/types";

export function useFileSystem() {
  const [projectPath, setProjectPath] = useState<string | undefined>(undefined);

  // #region Open Folder
  function openFolder(uri: string): Folder {
    return [];
  }

  function openFolderCapacitor(uri: string): Folder {
    return [];
  }
  function openFolderElectron(uri: string): Folder {
    return [];
  }
  function openFolderVSCode(uri: string): Folder {
    return [];
  }
  function openFolderWeb(uri: string): Folder {
    return [];
  }
  // #endregion

  // #region Save Folder
  function saveFolder(folder: Folder, uriPrefix: string) {}

  function saveFolderCapacitor(folder: Folder, uriPrefix: string) {}
  function saveFolderElectron(folder: Folder, uriPrefix: string) {}
  function saveFolderVSCode(folder: Folder, uriPrefix: string) {}
  function saveFolderWeb(folder: Folder, uriPrefix: string) {}
  // #endregion

  // #region Read File
  function readFile(uri: string): File {
    return new File([], "");
  }

  function readFileCapacitor(uri: string): File {
    return new File([], "");
  }
  function readFileElectron(uri: string): File {
    return new File([], "");
  }
  function readFileVSCode(uri: string): File {
    return new File([], "");
  }
  function readFileWeb(uri: string): File {
    return new File([], "");
  }
  // #endregion

  // #region Write File
  function writeFile(file: File, uri: string) {}

  function writeFileCapacitor(file: File, uri: string) {}
  function writeFileElectron(file: File, uri: string) {}
  function writeFileVSCode(file: File, uri: string) {}
  function writeFileWeb(file: File, uri: string) {}
  // #endregion

  return { projectPath, openFolder };
}
