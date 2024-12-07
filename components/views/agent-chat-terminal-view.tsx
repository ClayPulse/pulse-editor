"use client";

import {
  Dispatch,
  forwardRef,
  MutableRefObject,
  SetStateAction,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import ViewLayout from "./layout";
import { AgentConfig, ChatMessage, ViewDocument, ViewRef } from "@/lib/types";
import { Avatar, Button, Divider, Input, Tooltip } from "@nextui-org/react";
import Icon from "../icon";
import { getModelLLM } from "@/lib/llm/llm";
import toast from "react-hot-toast";
import { TerminalAgent } from "@/lib/agent/terminal-agent";
import { CodeEditorViewRef } from "./code-editor-view";
import { motion } from "framer-motion";
import { BeatLoader } from "react-spinners";
import AgentConfigModal from "../modals/agent-config-modal";
import { EditorContext } from "../providers/editor-context-provider";

export type AgentChatTerminalViewRef = ViewRef;

interface AgentChatTerminalViewProps {
  viewMap: MutableRefObject<Map<string, ViewRef | null>>;
}

const defaultAgents: AgentConfig[] = [
  {
    name: "Online Search Agent",
    icon: "language",
    description: "An agent searches information online",
    prompt:
      "You are an agent who searches online for the given query. User says {userMessage}. {viewContent}",
  },
  {
    name: "Test Agent",
    icon: "science",
    description: "An agent adds test cases",
    prompt:
      "You are an agent who helps user write test cases for the given code. User says {userMessage}. {viewContent}",
  },
  {
    name: "Add Comment Agent",
    icon: "add_comment",
    description: "An agent adds comments",
    prompt:
      "You are an agent who helps user add comments to the given code. User says {userMessage}. {viewContent}",
  },
  {
    name: "Beautify Code Agent",
    icon: "auto_fix_high",
    description: "An agent beautifies the code",
    prompt:
      "You are an agent who helps user beautify the given code. User says {userMessage}. {viewContent}",
  },
];

function TerminalTabs({
  agents,
  selectedAgent,
  setSelectedAgent,
}: {
  agents: AgentConfig[];
  selectedAgent: AgentConfig | undefined;
  setSelectedAgent: Dispatch<SetStateAction<AgentConfig | undefined>>;
}) {
  const tabDivRef = useRef<HTMLDivElement | null>(null);
  const [isLeftScrollable, setIsLeftScrollable] = useState<boolean>(false);
  const [isRightScrollable, setIsRightScrollable] = useState<boolean>(false);

  function updateScroll() {
    if (tabDivRef.current) {
      setIsLeftScrollable(tabDivRef.current.scrollLeft > 0);
      setIsRightScrollable(
        tabDivRef.current.scrollLeft + tabDivRef.current.clientWidth <
          tabDivRef.current.scrollWidth - 1,
      );
    }
  }

  useEffect(() => {
    updateScroll();
  }, [agents]);

  return (
    <div className="mx-1 flex h-full items-center overflow-x-auto">
      <Button
        isIconOnly
        variant="light"
        size="sm"
        onPress={() => {
          // Scroll to the left
          tabDivRef.current?.scrollBy({
            left: -100,
            behavior: "smooth",
          });
        }}
        isDisabled={!isLeftScrollable}
      >
        <Icon name="arrow_left" />
      </Button>
      <div
        ref={tabDivRef}
        className="flex items-center overflow-x-auto scrollbar-hide"
        onScroll={(e) => {
          updateScroll();
        }}
      >
        {agents.map((agent, index) => (
          <div key={index} className="relative flex h-full items-center">
            {selectedAgent === agent && (
              <motion.div
                className="absolute z-10 h-8 w-full rounded-lg bg-content4 shadow-sm"
                layoutId="tab-indicator"
              ></motion.div>
            )}
            <Tooltip content={agent.description}>
              <Button
                className={`z-20 h-fit rounded-lg bg-transparent px-2 py-1`}
                disableRipple
                disableAnimation
                onPress={(e) => {
                  setSelectedAgent(agent);
                  // Move scroll location to the tab
                  const tab = e.target as HTMLElement;
                  tab?.scrollIntoView({
                    behavior: "smooth",
                    inline: "nearest",
                  });
                }}
              >
                <div
                  className={`flex items-center space-x-0.5 text-sm text-content1-foreground`}
                >
                  <Icon variant="outlined" name={agent.icon || "smart_toy"} />
                  <p>{agent.name}</p>
                </div>
              </Button>
            </Tooltip>
          </div>
        ))}
      </div>

      <Button
        isIconOnly
        variant="light"
        size="sm"
        onPress={() => {
          // Scroll to the right
          tabDivRef.current?.scrollBy({
            left: 100,
            behavior: "smooth",
          });
        }}
        isDisabled={!isRightScrollable}
      >
        <Icon name="arrow_right" />
      </Button>
    </div>
  );
}

function TerminalNavBar({
  agents,
  setAgents,
  selectedAgent,
  setSelectedAgent,
  chatHistoryMap,
  setCurrentChatHistory,
}: {
  agents: AgentConfig[];
  setAgents: Dispatch<SetStateAction<AgentConfig[]>>;
  selectedAgent: AgentConfig | undefined;
  setSelectedAgent: Dispatch<SetStateAction<AgentConfig | undefined>>;
  chatHistoryMap: MutableRefObject<Map<string, ChatMessage[]>>;
  setCurrentChatHistory: Dispatch<SetStateAction<ChatMessage[]>>;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="flex h-10 w-full flex-shrink-0 items-center bg-content2 text-content2-foreground">
      <TerminalTabs
        agents={agents}
        selectedAgent={selectedAgent}
        setSelectedAgent={setSelectedAgent}
      />
      <div className="flex h-full items-center py-2">
        <Divider orientation="vertical" />
        <Tooltip content="Add a new agent definition">
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onPress={() => {
              setIsOpen(true);
            }}
          >
            <Icon variant="outlined" name="add" />
          </Button>
        </Tooltip>
        <AgentConfigModal
          setAgents={setAgents}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
      </div>
      <div className="flex flex-grow justify-end pr-2">
        <Tooltip content="Refresh agent instance">
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onPress={() => {
              if (selectedAgent) {
                chatHistoryMap.current.set(selectedAgent.name, []);
                setCurrentChatHistory([]);
              }
            }}
          >
            <Icon name="refresh" />
          </Button>
        </Tooltip>
        <Tooltip content="Close agent instance">
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onPress={() => {
              if (selectedAgent) {
                const newAgents = agents.filter(
                  (agent) => agent.name !== selectedAgent.name,
                );
                setAgents(newAgents);
                setSelectedAgent(newAgents[0]);
              }
            }}
          >
            <Icon name="delete" className="text-danger" />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}

const AgentChatTerminalView = forwardRef(
  ({}, ref: React.Ref<AgentChatTerminalViewRef>) => {
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
    const [isThinking, setIsThinking] = useState<boolean>(false);

    const editorContext = useContext(EditorContext);

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
          editorContext?.persistSettings?.llmAPIKey &&
          editorContext?.persistSettings?.llmProvider &&
          editorContext?.persistSettings?.llmModel
        ) {
          const llm = getModelLLM(
            editorContext?.persistSettings.llmAPIKey,
            editorContext?.persistSettings.llmProvider,
            editorContext?.persistSettings.llmModel,
            0.85,
          );
          agentRef.current = new TerminalAgent(llm, selectedAgent);
        }
      }
    }, [selectedAgent]);

    useEffect(() => {
      setSelectedAgent(agents[0] || undefined);
    }, [agents]);

    async function onInputSubmit(content: string) {
      if (!agentRef.current) {
        toast.error("LLM agent is not configured");
      }

      const userMessage: ChatMessage = {
        from: "User",
        content: content,
        datetime: new Date().toLocaleDateString(),
      };
      setCurrentChatHistory((prev) => [...prev, userMessage]);
      setInputValue("");
      setIsThinking(true);

      // Get all code editor views and their content
      const codeEditorViews =
        editorContext?.getViewByType("CodeEditorView") ?? [];
      const viewDocuments: ViewDocument[] = [];
      codeEditorViews.forEach((view) => {
        const codeEditorView = view as CodeEditorViewRef;
        const viewDocument = codeEditorView.getViewDocument();
        if (viewDocument) {
          viewDocuments.push(viewDocument);
        }
      });

      const viewContent = viewDocuments
        .map((view, index) => `Code file ${index}:\n${view.fileContent}`)
        .join("\n\n");

      try {
        const res = await agentRef.current?.generateAgentCompletion(
          userMessage,
          viewContent,
        );

        const agentMessage: ChatMessage = {
          from: selectedAgent?.name || "Agent",
          content: res || "No response",
          datetime: new Date().toLocaleDateString(),
        };

        setCurrentChatHistory((prev) => [...prev, agentMessage]);
      } catch (e) {
        toast.error("Error in generating agent completion. Please try again.");
      }
      setIsThinking(false);
    }

    function MessageBlock({ message }: { message: ChatMessage }) {
      return (
        <div className="flex w-full space-x-2 text-base">
          <div className="pt-0.5">
            <Avatar />
          </div>
          <div className="flex w-full min-w-0 flex-grow flex-col space-y-1.5">
            <div className="flex h-4 space-x-3">
              <p className="font-bold">
                {message.from === "User" ? "You" : message.from}
              </p>
              <p className="opacity-60">{message.datetime}</p>
            </div>
            <div className="w-full">
              <p className="w-full whitespace-pre-wrap break-words">
                {message.content}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <ViewLayout>
        <div className="flex h-full w-full flex-col bg-content1 pb-3">
          <TerminalNavBar
            agents={agents}
            setAgents={setAgents}
            selectedAgent={selectedAgent}
            setSelectedAgent={setSelectedAgent}
            chatHistoryMap={chatHistoryMap}
            setCurrentChatHistory={setCurrentChatHistory}
          />
          <div
            ref={chatListRef}
            className="min-h-0 w-full flex-grow space-y-2 overflow-y-auto px-4 py-1"
          >
            {currentChatHistory.map((message, index) => (
              <MessageBlock key={index} message={message} />
            ))}
            {isThinking && (
              <div className="flex w-full justify-center">
                <BeatLoader className="[&>span]:!bg-content1-foreground" />
              </div>
            )}
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
                  onPress={() => {
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
