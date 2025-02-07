import { Extension, FileViewModel } from "@/lib/types";
import { useContext, useEffect, useState } from "react";
import { EditorContext } from "../providers/editor-context-provider";
import FileViewLayout from "./layout";
import ExtensionLoader from "../extension-loader";
import { ViewBoxMessage, ViewBoxMessageTypeEnum } from "@pulse-editor/types";
import Loading from "../loading";
import useIMC from "@/lib/hooks/use-imc";

export default function FileView({
  model,
  updateFileView,
}: {
  model: FileViewModel;
  updateFileView: (model: FileViewModel) => void;
}) {
  const editorContext = useContext(EditorContext);
  const [usedExtension, setUsedExtension] = useState<Extension | undefined>(
    undefined,
  );
  const [hasExtension, setHasExtension] = useState(true);

  const [isExtensionWindowReady, setIsExtensionWindowReady] = useState(false);
  const [isExtensionLoaded, setIsExtensionLoaded] = useState(false);

  const receiverHandlerMap = new Map<
    ViewBoxMessageTypeEnum,
    (senderWindow: Window, message: ViewBoxMessage) => Promise<any>
  >([
    [
      ViewBoxMessageTypeEnum.Ready,
      async (senderWindow: Window, message: ViewBoxMessage) => {
        setIsExtensionWindowReady((prev) => true);
        setIsExtensionLoaded((prev) => false);
        imc?.initOtherWindow(senderWindow);
      },
    ],
    [
      ViewBoxMessageTypeEnum.Loaded,
      async (senderWindow: Window, message: ViewBoxMessage) => {
        setIsExtensionLoaded((prev) => true);
      },
    ],
    [
      ViewBoxMessageTypeEnum.WriteViewFile,
      async (senderWindow: Window, message: ViewBoxMessage) => {
        if (message.payload) {
          const payload: FileViewModel = message.payload;
          updateFileView(payload);
        }
      },
    ],
  ]);

  const { imc } = useIMC(receiverHandlerMap);

  useEffect(() => {
    // Get the filename from the file path
    const fileName = model.filePath.split("/").pop();
    // Remove the first part of the filename -- remove front part of the filename
    const fileType = fileName?.split(".").slice(1).join(".") ?? "";

    // Get the extension config from the file type
    const map = editorContext?.persistSettings?.defaultFileTypeExtensionMap;

    if (map) {
      if (map[fileType] === undefined) {
        setHasExtension(false);
        setUsedExtension(undefined);
        return;
      }
      const extension = map[fileType];
      setUsedExtension(extension);
      setHasExtension(true);
    }
  }, [model]);

  useEffect(() => {
    // Send view file update to the extension
    if (isExtensionLoaded && imc) {
      imc.sendMessage(ViewBoxMessageTypeEnum.ViewFileChange, model);
    }
  }, [isExtensionLoaded, imc]);

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
            key={model.filePath}
            remoteOrigin={usedExtension.remoteOrigin}
            moduleId={usedExtension.config.id}
            moduleVersion={usedExtension.config.version}
          />
        </div>
      ) : hasExtension ? (
        <div className="absolute left-0 top-0 h-full w-full">
          <Loading />
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
