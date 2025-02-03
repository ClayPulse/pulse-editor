"use client";

import ExtensionLoader from "@/components/extension-loader";
import { Extension } from "@/lib/types";
import { loadRemote, registerRemotes } from "@module-federation/runtime";
import { ExtensionTypeEnum } from "@pulse-editor/types";
import { useEffect, useState } from "react";

export default function Test() {
  const extension: Extension = {
    config: {
      // Do not use hyphen character '-' in the name
      id: "pulse_code_view",
      displayName: "Pulse Extension Template",
      description: "Pulse extension template",
      version: "v0.0.1",
      extensionType: ExtensionTypeEnum.FileView,
      fileTypes: ["txt", "json", "py", "cpp", "c", "tsx", "ts", "js", "jsx"],
    },
    isEnabled: true,
    remoteOrigin: "http://localhost:3001",
  };

  useEffect(() => {
    registerRemotes([
      {
        name: extension.config.id,
        entry: `${extension.remoteOrigin}/${extension.config.id}/${extension.config.version}/mf-manifest.json`,
      },
    ]);
  }, []);

  return <ExtensionLoader extension={extension} />;
}
