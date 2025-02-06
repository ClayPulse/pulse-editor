import { InterModuleCommunication } from "@pulse-editor/shared-utils";
import { ViewBoxMessage, ViewBoxMessageTypeEnum } from "@pulse-editor/types";
import { useEffect, useState } from "react";

export default function useTheme(moduleName: string) {
  const [theme, setTheme] = useState<string>("light");
  const receiverHandlerMap = new Map<
    ViewBoxMessageTypeEnum,
    (senderWindow: Window, message: ViewBoxMessage) => Promise<void>
  >();

  receiverHandlerMap.set(
    ViewBoxMessageTypeEnum.GetTheme,
    async (senderWindow: Window, message: ViewBoxMessage) => {
      const theme = message.payload
        ? JSON.parse(message.payload).theme
        : "light";
      setTheme(theme);
    }
  );

  const [, setImc] = useState<InterModuleCommunication | undefined>(undefined);

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

  return {
    theme,
  };
}
