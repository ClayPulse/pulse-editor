import { InterModuleCommunication } from "@pulse-editor/shared-utils";
import { Agent, IMCMessage, IMCMessageTypeEnum } from "@pulse-editor/types";
import { useEffect, useState } from "react";

export default function useAgents(moduleName: string) {
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
    // Init IMC
    const imc = new InterModuleCommunication(moduleName);
    imc.initThisWindow(window, receiverHandlerMap);
    imc.initOtherWindow(targetWindow);
    setImc(imc);
    setIsReady(true);

    console.log("Sent ready message");
    imc.sendMessage(IMCMessageTypeEnum.Ready);

    return () => {
      imc.close();
    };
  }, []);

  async function installAgent(config: Agent) {
    if (!imc) {
      throw new Error("IMC not initialized.");
    }

    await imc
      .sendMessage(IMCMessageTypeEnum.InstallAgent, config)
      .then((response) => {
        if (response.type === IMCMessageTypeEnum.Error) {
          throw new Error(response.payload);
        }
      });
  }

  async function runAgentMethod(
    agentName: string,
    methodName: string,
    parameters: Record<string, any>,
    abortSignal?: AbortSignal
  ): Promise<Record<string, any>> {
    if (!imc) {
      throw new Error("IMC not initialized.");
    }

    const result = await imc
      .sendMessage(
        IMCMessageTypeEnum.RunAgentMethod,
        {
          agentName,
          methodName,
          parameters,
        },
        abortSignal
      )
      .then((response) => {
        return response as Record<string, any>;
      });

    return result;
  }

  return {
    installAgent,
    runAgentMethod,
    isReady,
  };
}
