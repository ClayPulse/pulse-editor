import { Extension, FileViewModel } from "@/lib/types";
import { useContext, useEffect, useState } from "react";
import { EditorContext } from "../providers/editor-context-provider";
import FileViewLayout from "./layout";
import ViewExtensionLoader from "./view-extension-loader";
import { Agent, IMCMessage, IMCMessageTypeEnum } from "@pulse-editor/types";
import Loading from "../loading";
import useIMC from "@/lib/hooks/use-imc";
import { decrypt } from "@/lib/security/simple-password";
import useAgentRunner from "@/lib/hooks/use-agent-runner";

export default function FileView({
  model,
  updateFileView,
}: {
  model: FileViewModel;
  updateFileView: (model: FileViewModel) => void;
}) {
  const editorContext = useContext(EditorContext);
  const [usedExtension, setUsedExtension] = useState<Extension | undefined>(
    undefined,
  );
  const [hasExtension, setHasExtension] = useState(true);

  const [isExtensionWindowReady, setIsExtensionWindowReady] = useState(false);
  const [isExtensionLoaded, setIsExtensionLoaded] = useState(false);

  const { runAgentMethod } = useAgentRunner();

  const receiverHandlerMap = new Map<
    IMCMessageTypeEnum,
    (senderWindow: Window, message: IMCMessage) => Promise<any>
  >([
    [
      IMCMessageTypeEnum.Ready,
      async (senderWindow: Window, message: IMCMessage) => {
        setIsExtensionWindowReady((prev) => true);
        setIsExtensionLoaded((prev) => false);
        imc?.initOtherWindow(senderWindow);
      },
    ],
    [
      IMCMessageTypeEnum.Loaded,
      async (senderWindow: Window, message: IMCMessage) => {
        setIsExtensionLoaded((prev) => true);
      },
    ],
    [
      IMCMessageTypeEnum.WriteViewFile,
      async (senderWindow: Window, message: IMCMessage) => {
        if (message.payload) {
          const payload: FileViewModel = message.payload;
          updateFileView(payload);
        }
      },
    ],
    [
      IMCMessageTypeEnum.InstallAgent,
      async (senderWindow: Window, message: IMCMessage) => {
        if (!message.payload) {
          throw new Error("No agent config provided.");
        }

        const agentConfig: Agent = message.payload;

        // Install the agent
        if (
          !editorContext?.persistSettings?.agents?.find(
            (agent) => agent.name === agentConfig.name,
          )
        ) {
          editorContext?.setPersistSettings((prev) => {
            return {
              ...prev,
              agents: [...(prev?.agents ?? []), agentConfig],
            };
          });
        }
      },
    ],
    [
      IMCMessageTypeEnum.RunAgentMethod,
      async (senderWindow: Window, message: IMCMessage) => {
        if (!message.payload) {
          throw new Error("No agent method config provided.");
        }

        const {
          agentName,
          methodName,
          parameters,
        }: {
          agentName: string;
          methodName: string;
          parameters: Record<string, any>;
        } = message.payload;
        const agent = editorContext?.persistSettings?.agents?.find(
          (agent) => agent.name === agentName,
        );

        if (!agent) {
          throw new Error("Agent not found.");
        }

        const method = agent.availableMethods.find(
          (method) => method.name === methodName,
        );

        if (!method) {
          throw new Error("Agent method not found.");
        }

        // Use agent's default LLM config if method doesn't have one
        const llmConfig = method.LLMConfig ? method.LLMConfig : agent.LLMConfig;

        // Execute the agent method
        const apiKey = editorContext?.persistSettings?.llmAPIKey
          ? editorContext?.persistSettings?.isPasswordSet &&
            editorContext?.editorStates.password
            ? decrypt(
                editorContext?.persistSettings?.llmAPIKey,
                editorContext.editorStates.password,
              )
            : editorContext?.persistSettings?.llmAPIKey
          : undefined;

        if (!apiKey) {
          throw new Error(`LLM for provider ${llmConfig.provider} not found.`);
        }

        const result = await runAgentMethod(agent, methodName, parameters);

        return result;
      },
    ],
  ]);

  const { imc } = useIMC(receiverHandlerMap);

  useEffect(() => {
    // Get the filename from the file path
    const fileName = model.filePath.split("/").pop();
    // Remove the first part of the filename -- remove front part of the filename
    const fileType = fileName?.split(".").slice(1).join(".") ?? "";

    // Get the extension config from the file type
    const map = editorContext?.persistSettings?.defaultFileTypeExtensionMap;

    if (map) {
      if (map[fileType] === undefined) {
        setHasExtension(false);
        setUsedExtension(undefined);
        return;
      }
      const extension = map[fileType];
      setUsedExtension(extension);
      setHasExtension(true);
    }
  }, [model]);

  useEffect(() => {
    // Send view file update to the extension
    if (isExtensionLoaded && imc) {
      imc.sendMessage(IMCMessageTypeEnum.ViewFileChange, model);
    }
  }, [isExtensionLoaded, imc]);

  return (
    <FileViewLayout height="100%" width="100%">
      {usedExtension ? (
        <div className="relative h-full w-full">
          {!isExtensionLoaded && (
            <div className="absolute left-0 top-0 h-full w-full">
              <Loading />
            </div>
          )}
          <ViewExtensionLoader
            key={model.filePath}
            remoteOrigin={usedExtension.remoteOrigin}
            moduleId={usedExtension.config.id}
            moduleVersion={usedExtension.config.version}
          />
        </div>
      ) : hasExtension ? (
        <div className="absolute left-0 top-0 h-full w-full">
          <Loading />
        </div>
      ) : (
        <div>
          No default view found for this file type. Find a compatible extension
          in marketplace, and enable it in settings as the default method to
          open this file.
        </div>
      )}
    </FileViewLayout>
  );
}
