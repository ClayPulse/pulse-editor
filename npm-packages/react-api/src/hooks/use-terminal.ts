import { IMCMessage, IMCMessageTypeEnum } from "@pulse-editor/types";
import useIMC from "../lib/hooks/use-imc";
import { useEffect, useState } from "react";

export default function useTerminal(moduleName: string) {
  const receiverHandlerMap = new Map<
    IMCMessageTypeEnum,
    (senderWindow: Window, message: IMCMessage) => Promise<void>
  >();

  const { imc, isReady } = useIMC(moduleName, receiverHandlerMap);
  const [socketUrl, setSocketUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isReady) {
      imc?.sendMessage(IMCMessageTypeEnum.RequestTerminal).then((response) => {
        const { socketUrl } = response;
        setSocketUrl(socketUrl);
      });
    }
  }, [isReady]);

  return {
    socketUrl,
  };
}
