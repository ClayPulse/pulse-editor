import { Extension, FileViewModel, InstalledAgent } from "@/lib/types";
import { useContext, useEffect, useState } from "react";
import { EditorContext } from "../../providers/editor-context-provider";
import FileViewLayout from "../layout";
import ExtensionLoader from "../../misc/extension-loader";
import { Agent, IMCMessage, IMCMessageTypeEnum } from "@pulse-editor/types";
import Loading from "../../interface/loading";
import useAgentRunner from "@/lib/hooks/use-agent-runner";
import { useTheme } from "next-themes";
import { InterModuleCommunication } from "@pulse-editor/shared-utils";
import { usePlatformApi } from "@/lib/hooks/use-platform-api";

export default function ConsoleViewLoader({
  consoleExt,
}: {
  consoleExt: Extension | undefined;
}) {
  const editorContext = useContext(EditorContext);
  const [usedExtension, setUsedExtension] = useState<Extension | undefined>(
    undefined,
  );
  const [hasExtension, setHasExtension] = useState(false);

  const [isExtensionWindowReady, setIsExtensionWindowReady] = useState(false);
  const [isExtensionLoaded, setIsExtensionLoaded] = useState(false);

  const { runAgentMethod } = useAgentRunner();

  const [imc, setImc] = useState<InterModuleCommunication | undefined>(
    undefined,
  );

  const { resolvedTheme } = useTheme();

  const { platformApi } = usePlatformApi();

  useEffect(() => {
    // Start a terminal
    platformApi?.createTerminal();
  }, [platformApi]);

  useEffect(() => {
    function getAndLoadExtension() {
      const extension = consoleExt;
      if (extension === undefined) {
        setHasExtension(false);
        setUsedExtension(undefined);
        return;
      }

      // Create IMC
      const newImc = new InterModuleCommunication("Pulse Editor Main");
      newImc.initThisWindow(window);
      newImc.updateReceiverHandlerMap(getHandlerMap());
      setImc(newImc);

      setUsedExtension(extension);
      setHasExtension(true);
    }

    if (consoleExt) {
      // Reset the extension and IMC
      if (imc) {
        imc.close();
        setImc(undefined);

        setIsExtensionWindowReady(false);
        setIsExtensionLoaded(false);
        setUsedExtension(undefined);
      }
      getAndLoadExtension();
    }
  }, [consoleExt]);

  useEffect(() => {
    // Send theme update to the extension
    if (isExtensionWindowReady && imc) {
      imc.sendMessage(IMCMessageTypeEnum.ThemeChange, resolvedTheme);
    }
  }, [isExtensionWindowReady, imc, resolvedTheme]);

  useEffect(() => {
    imc?.updateReceiverHandlerMap(getHandlerMap());
  }, [editorContext, imc]);

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
          console.log("Extension window ready.");
          if (!imc) {
            throw new Error("IMC not initialized.");
          }
          imc.initOtherWindow(senderWindow);
          setIsExtensionWindowReady((prev) => true);
          setIsExtensionLoaded((prev) => false);
        },
      ],
      [
        IMCMessageTypeEnum.Loaded,
        async (
          senderWindow: Window,
          message: IMCMessage,
          abortSignal?: AbortSignal,
        ) => {
          console.log("Extension loaded.");
          setIsExtensionLoaded((prev) => true);
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
      [
        IMCMessageTypeEnum.RequestTerminal,
        async (
          senderWindow: Window,
          message: IMCMessage,
          abortSignal?: AbortSignal,
        ) => {
          // Get a shell terminal from native platform APIs
          const terminalUri = await platformApi?.createTerminal();
          console.log("Terminal URI:", terminalUri);
          return terminalUri;
        },
      ],
    ]);
    return newMap;
  }

  return (
    <div className="relative h-full w-full">
      {usedExtension ? (
        <div className="relative h-full w-full">
          {!isExtensionLoaded && (
            <div className="absolute left-0 top-0 h-full w-full">
              <Loading />
            </div>
          )}
          {imc && (
            <ExtensionLoader
              key={usedExtension.config.id}
              remoteOrigin={usedExtension.remoteOrigin}
              moduleId={usedExtension.config.id}
              moduleVersion={usedExtension.config.version}
            />
          )}
        </div>
      ) : hasExtension ? (
        <div className="absolute left-0 top-0 h-full w-full">
          <Loading />
        </div>
      ) : (
        <div>Select a tab to view console.</div>
      )}
    </div>
  );
}
