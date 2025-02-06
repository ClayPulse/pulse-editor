import { InterModuleCommunication } from "@pulse-editor/shared-utils";
import {
  ViewBoxMessage,
  ViewBoxMessageTypeEnum,
  FileViewModel,
} from "@pulse-editor/types";
import { useEffect, useState } from "react";

export default function useFileView(moduleName: string) {
  const [viewFile, setViewFile] = useState<FileViewModel | undefined>(
    undefined
  );
  const [isLoaded, setIsLoaded] = useState(false);

  const targetWindow = window.parent;

  const receiverHandlerMap = new Map<
    ViewBoxMessageTypeEnum,
    (senderWindow: Window, message: ViewBoxMessage) => Promise<void>
  >([
    [
      ViewBoxMessageTypeEnum.ViewFileChange,
      async (senderWindow: Window, message: ViewBoxMessage) => {
        const payload = message.payload
          ? (JSON.parse(message.payload) as FileViewModel)
          : undefined;
        console.log("Received view file message", payload);
        setViewFile(payload);
      },
    ],
  ]);

  const [imc, setImc] = useState<InterModuleCommunication | undefined>(
    undefined
  );

  useEffect(() => {
    // Init IMC
    const imc = new InterModuleCommunication(moduleName);
    imc.initThisWindow(window, receiverHandlerMap);
    imc.initOtherWindow(targetWindow);
    setImc(imc);

    console.log("Sent ready message");
    imc.sendMessage(ViewBoxMessageTypeEnum.Ready);

    return () => {
      imc.close();
    };
  }, []);

  useEffect(() => {
    imc?.sendMessage(ViewBoxMessageTypeEnum.Loaded);
  }, [isLoaded, imc]);

  function updateViewFile(file: FileViewModel) {
    // sender.sendMessage(ViewBoxMessageTypeEnum.ViewFile, JSON.stringify(file));
    imc?.sendMessage(
      ViewBoxMessageTypeEnum.WriteViewFile,
      JSON.stringify(file)
    );
  }

  return {
    viewFile,
    updateViewFile,
    setIsLoaded,
  };
}
