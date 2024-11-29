"use client";

import {
  forwardRef,
  MutableRefObject,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import ViewLayout from "./layout";
import {
  AgentConfig,
  ChatMessage,
  ViewDocument,
  ViewRef,
} from "@/lib/interface";
import {
  Avatar,
  Button,
  Divider,
  Input,
  Tab,
  Tabs,
  Tooltip,
} from "@nextui-org/react";
import Icon from "../icon";
import { getModelLLM } from "@/lib/llm/llm";
import useMenuStatesContext from "@/lib/hooks/use-menu-states-context";
import toast from "react-hot-toast";
import { TerminalAgent } from "@/lib/agent/terminal-agent";
import { CodeEditorViewRef } from "./code-editor-view";

export interface AgentChatTerminalViewRef extends ViewRef {}

interface AgentChatTerminalViewProps {
  viewMap: MutableRefObject<Map<string, ViewRef | null>>;
}

const defaultAgents: AgentConfig[] = [
  // {
  //   name: "Online Search Agent",
  //   icon: "language",
  //   tooltip: "An agent searches information online",
  //   prompt: "Search for information online",
  // },
  {
    name: "Test Agent",
    icon: "science",
    tooltip: "An agent adds test cases",
    prompt:
      "You are an agent who helps user write test cases for the given code. User says {userMessage}. {viewContent}",
  },
  {
    name: "Add Comment Agent",
    icon: "add_comment",
    tooltip: "An agent adds comments",
    prompt:
      "You are an agent who helps user add comments to the given code. User says {userMessage}. {viewContent}",
  },
  {
    name: "Beautify Code Agent",
    icon: "auto_fix_high",
    tooltip: "An agent beautifies the code",
    prompt:
      "You are an agent who helps user beautify the given code. User says {userMessage}. {viewContent}",
  },
];
const AgentChatTerminalView = forwardRef(
  (
    { viewMap }: AgentChatTerminalViewProps,
    ref: React.Ref<AgentChatTerminalViewRef>,
  ) => {
    useImperativeHandle(ref, () => ({
      getType: () => "AgentChatTerminalView",
    }));

    const [agents, setAgents] = useState<AgentConfig[]>([]);
    const [selectedAgent, setSelectedAgent] = useState<AgentConfig | undefined>(
      undefined,
    );
    const agentRef = useRef<TerminalAgent | null>(null);

    const chatHistoryMap = useRef<Map<string, ChatMessage[]>>(new Map());
    const [currentChatHistory, setCurrentChatHistory] = useState<ChatMessage[]>(
      [],
    );

    const [inputValue, setInputValue] = useState<string>("");
    const chatListRef = useRef<HTMLDivElement>(null);

    const { menuStates } = useMenuStatesContext();

    useEffect(() => {
      setAgents(defaultAgents);
    }, []);

    useEffect(() => {
      // Scroll chat list to bottom
      if (chatListRef.current) {
        chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
      }

      // Update chat history map
      if (selectedAgent) {
        chatHistoryMap.current.set(selectedAgent.name, currentChatHistory);
      }
    }, [currentChatHistory]);

    useEffect(() => {
      if (selectedAgent) {
        // Get chat history
        if (!chatHistoryMap.current.has(selectedAgent.name)) {
          chatHistoryMap.current.set(selectedAgent.name, []);
        }
        setCurrentChatHistory(
          chatHistoryMap.current.get(selectedAgent.name) || [],
        );

        if (
          menuStates?.settings?.llmAPIKey &&
          menuStates?.settings?.llmProvider &&
          menuStates?.settings?.llmModel
        ) {
          const llm = getModelLLM(
            menuStates.settings.llmAPIKey,
            menuStates.settings.llmProvider,
            menuStates.settings.llmModel,
            0.85,
          );
          agentRef.current = new TerminalAgent(llm, selectedAgent);
        }
      }
    }, [selectedAgent]);

    async function onInputSubmit(content: string) {
      if (!agentRef.current) {
        toast.error("LLM agent is not configured");
      }

      const userMessage: ChatMessage = {
        from: "User",
        content: content,
        datetime: new Date().toISOString(),
      };
      setCurrentChatHistory((prev) => [...prev, userMessage]);
      setInputValue("");

      // Get all code editor views and their content
      let viewDocuments: ViewDocument[] = [];
      viewMap.current.forEach((view) => {
        if (view?.getType() === "CodeEditorView") {
          const codeEditorView = view as CodeEditorViewRef;
          const viewDocument = codeEditorView.getViewDocument();
          if (viewDocument) {
            viewDocuments.push(viewDocument);
          }
        }
      });

      const viewContent = viewDocuments
        .map((view, index) => `Code file ${index}:\n${view.fileContent}`)
        .join("\n\n");

      const res = await agentRef.current?.generateAgentCompletion(
        userMessage,
        viewContent,
      );

      const agentMessage: ChatMessage = {
        from: selectedAgent?.name || "Agent",
        content: res || "No response",
        datetime: new Date().toISOString(),
      };

      setCurrentChatHistory((prev) => [...prev, agentMessage]);
    }

    function TerminalTabs({ agents }: { agents: AgentConfig[] }) {
      return (
        <div className="flex h-10 w-full flex-shrink-0 items-center bg-content3 text-content2-foreground">
          <div>
            <Tabs
              items={agents}
              selectedKey={selectedAgent?.name}
              onSelectionChange={(key) => {
                const agent = agents.find(
                  (agent) => agent.name === key.toString(),
                );
                setSelectedAgent(agent);
              }}
              classNames={{
                tabList: ["bg-content3", "gap-0"],
              }}
            >
              {(agent) => (
                <Tab
                  key={agent.name}
                  title={
                    <div className="flex items-center space-x-0.5 text-content2-foreground group-data-[selected=true]:text-default-foreground">
                      <Icon
                        variant="outlined"
                        name={agent.icon || "smart_toy"}
                      />
                      <p>{agent.name}</p>
                    </div>
                  }
                  className="px-2"
                />
              )}
            </Tabs>
          </div>
          <div className="flex h-full items-center py-2">
            <Divider orientation="vertical" />
            <Tooltip content="Add new agent">
              <Button isIconOnly variant="light" size="sm">
                <Icon variant="outlined" name="add" />
              </Button>
            </Tooltip>
          </div>
          <div className="flex flex-grow justify-end pr-2">
            <Tooltip content="Refresh agent instance">
              <Button isIconOnly variant="light" size="sm">
                <Icon name="refresh" />
              </Button>
            </Tooltip>
            <Tooltip content="Delete agent instance">
              <Button isIconOnly variant="light" size="sm">
                <Icon name="delete" className="text-danger" />
              </Button>
            </Tooltip>
          </div>
        </div>
      );
    }

    function MessageBlock({ message }: { message: ChatMessage }) {
      return (
        <div className="flex space-x-2 text-base">
          <div className="pt-0.5">
            <Avatar />
          </div>
          <div className="flex flex-grow flex-col space-y-1.5">
            <div className="flex h-4 space-x-3">
              <p className="font-bold">
                {message.from === "User" ? "You" : message.from}
              </p>
              <p className="opacity-60">{message.datetime}</p>
            </div>
            <div>
              <p className="whitespace-pre">{message.content}</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <ViewLayout>
        <div className="flex h-[400px] min-h-[240px] w-full flex-col bg-content1 pb-3">
          <TerminalTabs agents={agents} />
          <div
            ref={chatListRef}
            className="min-h-0 flex-grow space-y-2 overflow-y-auto px-4 py-1"
          >
            {currentChatHistory.map((message, index) => (
              <MessageBlock key={index} message={message} />
            ))}
          </div>
          <Input
            className="px-2"
            placeholder="Type a message"
            classNames={{
              inputWrapper: ["data-[hover=true]:bg-content2", "pl-4"],
              input: ["text-base"],
            }}
            endContent={
              <div className="flex h-full items-center">
                <Button isIconOnly variant="light" size="sm">
                  <Icon variant="outlined" name="insert_link" />
                </Button>
                <Button isIconOnly variant="light" size="sm">
                  <Icon variant="outlined" name="insert_photo" />
                </Button>
                <Button isIconOnly variant="light" size="sm">
                  <Icon variant="outlined" name="insert_drive_file" />
                </Button>
                <div className="h-full px-1 py-2">
                  <Divider orientation="vertical" />
                </div>
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onClick={() => {
                    onInputSubmit(inputValue);
                  }}
                >
                  <Icon variant="round" name="send" />
                </Button>
              </div>
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onInputSubmit(inputValue);
              }
            }}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>
      </ViewLayout>
    );
  },
);
AgentChatTerminalView.displayName = "AgentChatTerminalView";

export default AgentChatTerminalView;
