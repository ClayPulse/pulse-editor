import { InterModuleCommunication } from "@pulse-editor/shared-utils";
import { AgentTool, IMCMessage, IMCMessageTypeEnum } from "@pulse-editor/types";
import { useEffect, useState } from "react";

export default function useAgentTools(moduleName: string) {
  const [imc, setImc] = useState<InterModuleCommunication | undefined>(
    undefined
  );
  const [isReady, setIsReady] = useState(false);

  const receiverHandlerMap = new Map<
    IMCMessageTypeEnum,
    (senderWindow: Window, message: IMCMessage) => Promise<void>
  >();

  const targetWindow = window.parent;

  useEffect(() => {
    const imc = new InterModuleCommunication(moduleName);
    imc.initThisWindow(window);
    imc.updateReceiverHandlerMap(receiverHandlerMap);
    imc.initOtherWindow(targetWindow);
    setImc(imc);
    setIsReady(true);

    imc.sendMessage(IMCMessageTypeEnum.Ready);

    return () => {
      imc.close();
    };
  }, []);

  async function installAgentTool(tool: AgentTool) {
    if (!imc) {
      throw new Error("IMC not initialized.");
    }

    await imc
      .sendMessage(IMCMessageTypeEnum.InstallAgentTool, tool)
      .then((response) => {
        if (response.type === IMCMessageTypeEnum.Error) {
          throw new Error(response.payload);
        }
      });
  }

  return { installAgentTool };
}
