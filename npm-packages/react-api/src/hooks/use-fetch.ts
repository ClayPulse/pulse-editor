import { InterModuleCommunication } from "@pulse-editor/shared-utils";
import { ViewBoxMessage, ViewBoxMessageTypeEnum } from "@pulse-editor/types";
import { useEffect, useState } from "react";

export default function useFetch(moduleName: string) {
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

  function fetch(uri: string, options?: RequestInit): Promise<Response> {
    if (!imc) {
      throw new Error("IMC is not initialized.");
    }

    return imc.sendMessage(
      ViewBoxMessageTypeEnum.Fetch,
      JSON.stringify({ uri, options })
    );
  }

  return { fetch };
}
