import { InterModuleCommunication } from "@pulse-editor/shared-utils";
import {
  AgentConfig,
  AgentMethodResult,
  ViewBoxMessage,
  ViewBoxMessageTypeEnum,
} from "@pulse-editor/types";
import { useEffect, useState } from "react";

export default function useAgent(moduleName: string, agentName: string) {
  const [agentConfig, setAgentConfig] = useState<AgentConfig | undefined>(
    undefined
  );

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

  useEffect(() => {
    if (!agentConfig && imc) {
      imc
        .sendMessage(
          ViewBoxMessageTypeEnum.GetAgentConfig,
          JSON.stringify({ name: agentName })
        )
        .then((response) => {
          const config = JSON.parse(response.payload) as AgentConfig;
          setAgentConfig(config);
        });
    }
  }, [agentName, imc]);

  async function runAgentMethod(
    methodName: string,
    payload: unknown,
    abortSignal?: AbortSignal
  ): Promise<AgentMethodResult> {
    if (!imc) {
      throw new Error("IMC not initialized.");
    } else if (!agentConfig) {
      throw new Error("Agent config not loaded");
    }
    const result = await imc
      .sendMessage(
        ViewBoxMessageTypeEnum.RunAgentMethod,
        JSON.stringify({ agentName, methodName, payload }),
        abortSignal
      )
      .then((response) => {
        return JSON.parse(response.payload) as AgentMethodResult;
      });

    return result;
  }

  return { runAgentMethod };
}
