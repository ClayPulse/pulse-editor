import { InterModuleCommunication } from "@pulse-editor/shared-utils";
import { ViewBoxMessage, ViewBoxMessageTypeEnum } from "@pulse-editor/types";
import { useEffect, useState } from "react";

export default function useFileViewMessages() {
  const [isExtensionWindowReady, setIsExtensionWindowReady] = useState(false);
  const [isExtensionLoaded, setIsExtensionLoaded] = useState(false);

  const [imc, setImc] = useState<InterModuleCommunication | undefined>(
    undefined,
  );

  const receiverHandlerMap = new Map<
    ViewBoxMessageTypeEnum,
    (senderWindow: Window, message: ViewBoxMessage) => Promise<any>
  >([
    [
      ViewBoxMessageTypeEnum.Ready,
      async (senderWindow: Window, message: ViewBoxMessage) => {
        setIsExtensionWindowReady((prev) => true);
        console.log("Received ready message: ", imc);
        imc?.initOtherWindow(senderWindow);
      },
    ],
    [
      ViewBoxMessageTypeEnum.Loaded,
      async (senderWindow: Window, message: ViewBoxMessage) => {
        setIsExtensionLoaded((prev) => true);
      },
    ],
  ]);

  useEffect(() => {
    // Init IMC
    const newImc = new InterModuleCommunication("Pulse Editor Main");
    setImc(newImc);

    return () => {
      imc?.close();
    };
  }, []);

  useEffect(() => {
    if (imc) {
      imc.initThisWindow(window, receiverHandlerMap);
    }
  }, [imc]);

  return { imc, isExtensionLoaded, isExtensionWindowReady };
}
