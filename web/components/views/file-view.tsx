import { Extension, FileViewModel, InstalledAgent } from "@/lib/types";
import { useContext, useEffect, useState } from "react";
import { EditorContext } from "../providers/editor-context-provider";
import FileViewLayout from "./layout";
import ViewExtensionLoader from "./view-extension-loader";
import {
  Agent,
  IMCMessage,
  IMCMessageTypeEnum,
} from "@pulse-editor/types";
import Loading from "../loading";
import useIMC from "@/lib/hooks/use-imc";
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

  const { imc } = useIMC(getHandlerMap);

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

  function getHandlerMap() {
    const newMap = new Map<
      IMCMessageTypeEnum,
      {
        (
          senderWindow: Window,
          message: IMCMessage,
          abortSignal?: AbortSignal,
        ): Promise<any>;
      }
    >([
      [
        IMCMessageTypeEnum.Ready,
        async (
          senderWindow: Window,
          message: IMCMessage,
          abortSignal?: AbortSignal,
        ) => {
          setIsExtensionWindowReady((prev) => true);
          setIsExtensionLoaded((prev) => false);
          imc?.initOtherWindow(senderWindow);
        },
      ],
      [
        IMCMessageTypeEnum.Loaded,
        async (
          senderWindow: Window,
          message: IMCMessage,
          abortSignal?: AbortSignal,
        ) => {
          setIsExtensionLoaded((prev) => true);
        },
      ],
      [
        IMCMessageTypeEnum.WriteViewFile,
        async (
          senderWindow: Window,
          message: IMCMessage,
          abortSignal?: AbortSignal,
        ) => {
          if (message.payload) {
            const payload: FileViewModel = message.payload;
            updateFileView(payload);
          }
        },
      ],
      [
        IMCMessageTypeEnum.InstallAgent,
        async (
          senderWindow: Window,
          message: IMCMessage,
          abortSignal?: AbortSignal,
        ) => {
          if (!message.payload) {
            throw new Error("No agent config provided.");
          }

          const agentConfig: Agent = message.payload;

          // Install the agent
          if (
            !editorContext?.persistSettings?.installedAgents?.find(
              (agent) => agent.name === agentConfig.name,
            )
          ) {
            editorContext?.setPersistSettings((prev) => {
              const newAgent: InstalledAgent = {
                ...agentConfig,
                author: {
                  type: "extension",
                  extension: usedExtension?.config.displayName,
                  publisher: usedExtension?.config.author ?? "unknown",
                },
              };
              return {
                ...prev,
                installedAgents: [...(prev?.installedAgents ?? []), newAgent],
              };
            });
          }
        },
      ],
      [
        IMCMessageTypeEnum.RunAgentMethod,
        async (
          senderWindow: Window,
          message: IMCMessage,
          abortSignal?: AbortSignal,
        ) => {
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

          const agent = editorContext?.persistSettings?.installedAgents?.find(
            (agent) => agent.name === agentName,
          );

          if (!agent) {
            throw new Error("Agent not found.");
          }

          const result = await runAgentMethod(
            agent,
            methodName,
            parameters,
            abortSignal,
          );

          return result;
        },
      ],
    ]);
    return newMap;
  }

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
