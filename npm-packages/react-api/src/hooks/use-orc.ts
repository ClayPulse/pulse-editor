import { InterModuleCommunication } from "@pulse-editor/shared-utils";
import { ViewBoxMessage, ViewBoxMessageTypeEnum } from "@pulse-editor/types";
import { useEffect, useState } from "react";

export default function useOCR(moduleName: string) {
  const [imc, setImc] = useState<InterModuleCommunication | undefined>(
    undefined
  );

  const receiverHandlerMap = new Map<
    ViewBoxMessageTypeEnum,
    (senderWindow: Window, message: ViewBoxMessage) => Promise<void>
  >();

  const targetWindow = window.parent;

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

  async function recognizeText(uri: string): Promise<string> {
    if (!imc) {
      throw new Error("IMC is not initialized.");
    }

    // Send the message to the extension
    const result = await imc.sendMessage(
      ViewBoxMessageTypeEnum.OCR,
      { uri }
    );

    return result.payload.text;
  }

  return {
    recognizeText,
  };
}
