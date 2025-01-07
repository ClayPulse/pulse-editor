"use client";

import { getAbstractPlatformAPI } from "@/lib/platform-api/get-abstract-platform-api";
import { FileSystemObject } from "@/lib/types";

export default function Explorer({ uri }: { uri: string }) {
  const platform = getAbstractPlatformAPI();

  function discoverFiles() {
    const fileSystemObject: FileSystemObject = platform.openFolder(uri);
  }
}
