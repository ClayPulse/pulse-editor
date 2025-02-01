import { ExtensionConfig, FileViewModel } from "@/lib/types";
import { useContext, useEffect, useState } from "react";
import { EditorContext } from "../providers/editor-context-provider";
import FileViewLayout from "./layout";
import ExtensionLoader from "../extension-loader";

export default function FileView({ model }: { model: FileViewModel }) {
  const editorContext = useContext(EditorContext);
  const [fileType, setFileType] = useState<string | undefined>(undefined);
  const [usedExtension, setUsedExtension] = useState<
    ExtensionConfig | undefined
  >(undefined);

  useEffect(() => {
    // Get the filename from the file path
    const fileName = model.filePath.split("/").pop();
    // Remove the first part of the filename -- remove front part of the filename
    const fileType = fileName?.split(".").slice(1).join(".");

    setFileType(fileType);
  }, [model]);

  useEffect(() => {
    if (fileType) {
      // Get the extension config from the file type
      const map = editorContext?.persistSettings?.defaultFileTypeExtensionMap;

      if (map) {
        const extension = map[fileType];
        setUsedExtension(extension);
      }
    }
  }, [fileType]);

  return (
    <FileViewLayout height="100%" width="100%">
      {usedExtension ? (
        <ExtensionLoader extension={usedExtension} model={model} />
      ) : (
        <div>
          No default view found for this file type. Find a compatible extension
          in marketplace, and enable it in settings as the default method to
          open this file.
        </div>
      )}
    </FileViewLayout>
  );
}
