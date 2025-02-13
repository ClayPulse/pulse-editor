import { InterModuleCommunication } from "@pulse-editor/shared-utils";
import { IMCMessage, IMCMessageTypeEnum } from "@pulse-editor/types";
import { useEffect, useState } from "react";

export default function useTheme(moduleName: string) {
  const [theme, setTheme] = useState<string>("light");
  const receiverHandlerMap = new Map<
    IMCMessageTypeEnum,
    (senderWindow: Window, message: IMCMessage) => Promise<void>
  >();

  receiverHandlerMap.set(
    IMCMessageTypeEnum.ThemeChange,
    async (senderWindow: Window, message: IMCMessage) => {
      const theme = message.payload;
      setTheme((prev) => theme);
    }
  );

  const [, setImc] = useState<InterModuleCommunication | undefined>(undefined);

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

  return {
    theme,
  };
}
