import { InterModuleCommunication } from "@pulse-editor/shared-utils";
import { ViewBoxMessage, ViewBoxMessageTypeEnum } from "@pulse-editor/types";
import { useEffect, useState } from "react";

export default function useIMC(
  receiverHandlerMap: Map<
    ViewBoxMessageTypeEnum,
    (senderWindow: Window, message: ViewBoxMessage) => Promise<any>
  >,
) {
  const [imc, setImc] = useState<InterModuleCommunication | undefined>(
    undefined,
  );

  useEffect(() => {
    // Init IMC
    const newImc = new InterModuleCommunication("Pulse Editor Main");
    setImc(newImc);

    return () => {
      console.log("Closing Pulse Editor Main IMC for extension.");
      imc?.close();
    };
  }, []);

  useEffect(() => {
    if (imc) {
      // IMC must be present when initializing the other window
      imc.initThisWindow(window, receiverHandlerMap);
    }
  }, [imc]);

  return { imc };
}
