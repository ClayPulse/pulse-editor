import { InterModuleCommunication } from "@pulse-editor/shared-utils";
import {
  NotificationTypeEnum,
  IMCMessage,
  IMCMessageTypeEnum,
} from "@pulse-editor/types";
import { useEffect, useState } from "react";

export default function useNotification(moduleName: string) {
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
    imc.initThisWindow(window, receiverHandlerMap);
    imc.initOtherWindow(targetWindow);
    setImc(imc);

    console.log("Sent ready message");
    imc.sendMessage(IMCMessageTypeEnum.Ready);

    return () => {
      imc.close();
    };
  }, []);

  function openNotification(text: string, type: NotificationTypeEnum) {
    if (!imc) {
      throw new Error("IMC is not initialized.");
    }
    imc.sendMessage(IMCMessageTypeEnum.Notification, {
      text,
      type,
    });
  }

  return { openNotification };
}
