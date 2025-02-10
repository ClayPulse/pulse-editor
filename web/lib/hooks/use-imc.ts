import { InterModuleCommunication } from "@pulse-editor/shared-utils";
import { IMCMessage, IMCMessageTypeEnum } from "@pulse-editor/types";
import { useEffect, useState } from "react";

export default function useIMC(
  receiverHandlerMap: Map<
    IMCMessageTypeEnum,
    (senderWindow: Window, message: IMCMessage) => Promise<any>
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
