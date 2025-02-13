import { InterModuleCommunication } from "@pulse-editor/shared-utils";
import { IMCMessage, IMCMessageTypeEnum } from "@pulse-editor/types";
import { useEffect, useState } from "react";

export default function useOCR(moduleName: string) {
  const [imc, setImc] = useState<InterModuleCommunication | undefined>(
    undefined
  );

  const receiverHandlerMap = new Map<
    IMCMessageTypeEnum,
    (senderWindow: Window, message: IMCMessage) => Promise<void>
  >();

  const targetWindow = window.parent;

  useEffect(() => {
    // Init IMC
    const imc = new InterModuleCommunication(moduleName);
    imc.initThisWindow(window);
    imc.updateReceiverHandlerMap(receiverHandlerMap);
    imc.initOtherWindow(targetWindow);
    setImc(imc);

    console.log("Sent ready message");
    imc.sendMessage(IMCMessageTypeEnum.Ready);

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
      IMCMessageTypeEnum.OCR,
      { uri }
    );

    return result.payload.text;
  }

  return {
    recognizeText,
  };
}
