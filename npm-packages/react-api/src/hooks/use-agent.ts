import { MessageSender } from "@pulse-editor/shared-utils";
import {
  AgentConfig,
  AgentMethodResult,
  ViewBoxMessageTypeEnum,
} from "@pulse-editor/types";
import { useEffect, useState } from "react";
import { messageTimeout } from "@pulse-editor/types/src/constant";

export default function useAgent(agentName: string) {
  const [agentConfig, setAgentConfig] = useState<AgentConfig | undefined>(
    undefined
  );

  const sender = new MessageSender(window.parent, messageTimeout);

  useEffect(() => {
    if (!agentConfig) {
      sender
        .sendMessage(
          ViewBoxMessageTypeEnum.GetAgentConfig,
          JSON.stringify({ name: agentName })
        )
        .then((response) => {
          const config = JSON.parse(response.payload) as AgentConfig;
          setAgentConfig(config);
        });
    }
  }, [agentName]);

  async function runAgentMethod(
    methodName: string,
    payload: unknown,
    abortSignal?: AbortSignal
  ): Promise<AgentMethodResult> {
    if (!agentConfig) {
      throw new Error("Agent config not loaded");
    }
    const result = await sender
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
