import { InterModuleCommunication } from "@pulse-editor/shared-utils";
import { IMCMessage, IMCMessageTypeEnum } from "@pulse-editor/types";
import { useEffect, useState } from "react";

export default function useFetch(moduleName: string) {
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

  function fetch(uri: string, options?: RequestInit): Promise<Response> {
    if (!imc) {
      throw new Error("IMC is not initialized.");
    }

    return imc.sendMessage(
      IMCMessageTypeEnum.Fetch,
      JSON.stringify({ uri, options })
    );
  }

  return { fetch };
}
