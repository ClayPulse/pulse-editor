import { Extension, FileViewModel } from "@/lib/types";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { EditorContext } from "../providers/editor-context-provider";
import FileViewLayout from "./layout";
import ExtensionLoader from "../extension-loader";
import { MessageReceiver, MessageSender } from "@pulse-editor/shared-utils";
import {
  messageTimeout,
  ViewBoxMessage,
  ViewBoxMessageTypeEnum,
} from "@pulse-editor/types";
import Loading from "../loading";
import useFileViewMessages from "@/lib/hooks/messaging/use-file-view-messages";

export default function FileView({ model }: { model: FileViewModel }) {
  const editorContext = useContext(EditorContext);
  const [fileType, setFileType] = useState<string | undefined>(undefined);
  const [usedExtension, setUsedExtension] = useState<Extension | undefined>(
    undefined,
  );

  const { imc, isExtensionLoaded } = useFileViewMessages();

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

  useEffect(() => {
    // Send view file update to the extension
    if (isExtensionLoaded && imc && model) {
      imc.sendMessage(
        ViewBoxMessageTypeEnum.ViewFileChange,
        JSON.stringify(model),
      );
    }
  }, [isExtensionLoaded, imc, model]);

  return (
    <FileViewLayout height="100%" width="100%">
      {usedExtension ? (
        <div className="relative h-full w-full">
          {!isExtensionLoaded && (
            <div className="absolute left-0 top-0 h-full w-full">
              <Loading />
            </div>
          )}
          <ExtensionLoader
            remoteOrigin={usedExtension.remoteOrigin}
            moduleId={usedExtension.config.id}
            moduleVersion={usedExtension.config.version}
          />
        </div>
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
