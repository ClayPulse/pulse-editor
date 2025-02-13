import { InterModuleCommunication } from "@pulse-editor/shared-utils";
import {
  IMCMessage,
  IMCMessageTypeEnum,
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
    IMCMessageTypeEnum,
    (senderWindow: Window, message: IMCMessage) => Promise<void>
  >([
    [
      IMCMessageTypeEnum.ViewFileChange,
      async (senderWindow: Window, message: IMCMessage) => {
        const payload: FileViewModel | undefined = message.payload;
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
    imc.initThisWindow(window);
    imc.updateReceiverHandlerMap(receiverHandlerMap);
    imc.initOtherWindow(targetWindow);
    setImc(imc);

    imc.sendMessage(IMCMessageTypeEnum.Ready);

    return () => {
      console.log("Closing IMC for extension: ", moduleName);
      imc.close();
    };
  }, []);

  useEffect(() => {
    imc?.sendMessage(IMCMessageTypeEnum.Loaded);
  }, [isLoaded, imc]);

  function updateViewFile(file: FileViewModel) {
    // sender.sendMessage(ViewBoxMessageTypeEnum.ViewFile, JSON.stringify(file));
    imc?.sendMessage(IMCMessageTypeEnum.WriteViewFile, file);
  }

  return {
    viewFile,
    updateViewFile,
    setIsLoaded,
  };
}
