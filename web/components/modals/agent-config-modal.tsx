"use client";

import { useContext, useEffect, useState } from "react";
import ModalWrapper from "./modal-wrapper";
import { EditorContext } from "../providers/editor-context-provider";
import Icon from "../icon";
import { Button, Divider} from "@nextui-org/react";
import { LLMUsage, TabItem } from "@/lib/types";
import Tabs from "../tabs";
import PasswordInput from "../password-input";

function AgentConfigs() {
  const editorContext = useContext(EditorContext);
  return (
    <div className="flex flex-col space-y-2">
      {editorContext?.persistSettings?.installedAgents?.map((agent) => (
        <div
          key={agent.name}
          className="grid w-full grid-cols-[32px_auto_max-content] gap-x-2 p-1"
        >
          <div className="flex h-8 w-8 items-center justify-center">
            <Icon
              name="smart_toy"
              className="!text-[28px]"
              variant="outlined"
            />
          </div>

          <div className="flex flex-col">
            <div className="flex gap-x-2">
              <p className="font-semibold leading-5">{agent.name}</p>
              <p className="text-small leading-5 text-foreground-600">
                {agent.version}
              </p>
            </div>
            {agent.author.type === "user" ? (
              <p className="text-small leading-4 text-foreground-600">
                Installed by user {agent.author.publisher}
              </p>
            ) : (
              <p className="text-small leading-4 text-foreground-600">
                Installed by extension {agent.author.extension} from{" "}
                {agent.author.publisher}
              </p>
            )}
            <p className="pt-2 leading-4">{agent.description}</p>
            <div className="flex gap-x-1 pt-2">
              <p>LLM config:</p>
              <p>
                {agent.LLMConfig.provider + " " + agent.LLMConfig.modelName}
              </p>
            </div>
            <div className="flex w-full justify-end gap-1">
              <Button size="sm">Edit</Button>
              <Button size="sm" color="danger">
                Delete
              </Button>
            </div>
          </div>
        </div>
      ))}
      <Button>Create New Agent</Button>
    </div>
  );
}

function ProviderConfig({ usage }: { usage: LLMUsage }) {
  const editorContext = useContext(EditorContext);
  const [apiKey, setApiKey] = useState("");
  const [isRevealable, setIsRevealable] = useState(true);

  useEffect(() => {
    const key = editorContext?.persistSettings?.apiKeys
      ? editorContext?.persistSettings?.apiKeys[usage.provider]
      : undefined;

    if (key) {
      setApiKey("API Key is not visible after entered.");
      setIsRevealable(false);
    }
  }, []);

  return (
    <div>
      <div className="grid grid-cols-2">
        <p>Provider:</p>
        <p>{usage.provider}</p>

        <p>Used Models:</p>
        <p>{usage.usedModals.join(", ")}</p>

        <p>Used by agents:</p>
        <p>{usage.usedByAgents.join(", ")}</p>

        <p>Total number of agents:</p>
        <p>{usage.totalUsageByAgents}</p>
      </div>
      <PasswordInput
        className="w-full"
        label="API Key"
        size="sm"
        isRevealable={isRevealable}
        isReadOnly={!isRevealable}
        isDeletable={apiKey.length > 0}
        onDelete={() => {
          editorContext?.setPersistSettings((prev) => {
            const newApiKeys = { ...prev?.apiKeys };
            delete newApiKeys[usage.provider];

            return {
              ...prev,
              apiKeys: newApiKeys,
            };
          });
          setApiKey("");
          setIsRevealable(true);
        }}
        value={apiKey}
        onValueChange={(value) => {
          editorContext?.setPersistSettings((prev) => {
            return {
              ...prev,
              apiKeys: {
                ...prev?.apiKeys,
                [usage.provider]: value,
              },
            };
          });
          setApiKey(value);
        }}
      />
    </div>
  );
}

function ProviderConfigs({ llmUsageList }: { llmUsageList: LLMUsage[] }) {
  return (
    <div>
      <p className="font-semibold">LLM Usage by Agents</p>
      <div className="w-full space-y-1">
        {llmUsageList.map((usage, index) => (
          <div key={usage.provider} className="w-full space-y-1">
            {index > 0 && <Divider />}
            <ProviderConfig usage={usage} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AgentConfigModal({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const editorContext = useContext(EditorContext);

  const tabItems: TabItem[] = [
    {
      name: "Agents",
      description: "Manage installed agents",
    },
    {
      name: "Providers",
      description: "Manage AI providers",
    },
  ];
  const [selectedTab, setSelectedTab] = useState<TabItem | undefined>(
    tabItems[0],
  );

  function getLLMUsageByAgents() {
    const agents = editorContext?.persistSettings?.installedAgents ?? [];

    const usageList: LLMUsage[] = [];

    for (const agent of agents) {
      const provider = agent.LLMConfig.provider;
      const modelName = agent.LLMConfig.modelName;

      const existing = usageList.find((u) => u.provider === provider);

      if (existing) {
        if (!existing.usedModals.includes(modelName)) {
          existing.usedModals.push(modelName);
        }
        existing.usedByAgents.push(agent.name);
        existing.totalUsageByAgents += 1;
      } else {
        usageList.push({
          provider,
          usedModals: [modelName],
          usedByAgents: [agent.name],
          totalUsageByAgents: 1,
        });
      }
    }

    return usageList;
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title="Agents Configuration"
    >
      <div className="flex justify-center">
        <div className="rounded-md bg-content2 py-2">
          <Tabs
            tabItems={tabItems}
            selectedItem={selectedTab}
            setSelectedItem={setSelectedTab}
          />
        </div>
      </div>

      {selectedTab?.name === tabItems[0].name && <AgentConfigs />}
      {selectedTab?.name === tabItems[1].name && (
        <ProviderConfigs llmUsageList={getLLMUsageByAgents()} />
      )}
    </ModalWrapper>
  );
}
