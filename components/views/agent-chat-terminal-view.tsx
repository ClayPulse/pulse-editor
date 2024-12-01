"use client";

import {
  Dispatch,
  forwardRef,
  MutableRefObject,
  SetStateAction,
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
  Link,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Textarea,
  Tooltip,
} from "@nextui-org/react";
import Icon from "../icon";
import { getModelLLM } from "@/lib/llm/llm";
import useMenuStatesContext from "@/lib/hooks/use-menu-states-context";
import toast from "react-hot-toast";
import { TerminalAgent } from "@/lib/agent/terminal-agent";
import { CodeEditorViewRef } from "./code-editor-view";
import { motion } from "framer-motion";
import { BeatLoader } from "react-spinners";

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
    console.log(
      tabDivRef.current?.scrollLeft,
      tabDivRef.current?.scrollWidth,
      tabDivRef.current?.clientWidth,
    );
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
        onClick={() => {
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
                onClick={(e) => {
                  setSelectedAgent(agent);
                  // Move scroll location to the tab
                  const tab = e.currentTarget as HTMLElement;
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
        onClick={() => {
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
  const [name, setName] = useState<string>("");
  const [icon, setIcon] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");

  return (
    <div className="flex h-10 w-full flex-shrink-0 items-center bg-content2 text-content2-foreground">
      <TerminalTabs
        agents={agents}
        selectedAgent={selectedAgent}
        setSelectedAgent={setSelectedAgent}
      />
      <div className="flex h-full items-center py-2">
        <Divider orientation="vertical" />
        <Popover showArrow placement="bottom" backdrop="opaque">
          <PopoverTrigger>
            <Button isIconOnly variant="light" size="sm">
              <Icon variant="outlined" name="add" />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="h-80 w-60 overflow-y-auto px-1 py-2">
              <div className="flex flex-col space-y-2">
                <p>
                  Add a new agent definition by adding agent name, icon,
                  description, and prompt.
                </p>

                <Input
                  label="name"
                  placeholder="Enter agent name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  label="icon"
                  placeholder="Enter agent icon"
                  description={
                    <p>
                      You can use Material Icons. See available icons at
                      <Link
                        href="https://marella.me/material-icons/demo/"
                        target="_blank"
                        className="text-xs"
                      >
                        &nbsp; Available Icons
                      </Link>
                      .
                    </p>
                  }
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                />
                <Textarea
                  label="description"
                  placeholder="Enter agent description"
                  isMultiline
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <Textarea
                  label="prompt"
                  placeholder="Enter agent prompt"
                  isMultiline
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />

                <Button
                  onClick={() => {
                    const config: AgentConfig = {
                      name: name,
                      icon: icon === "" ? "smart_toy" : icon,
                      description: description,
                      prompt: prompt,
                    };

                    setAgents((prev) => [...prev, config]);
                  }}
                >
                  Add Agent
                </Button>

                <Divider />
                <p>
                  Alternatively, you can import or find agent in the
                  marketplace.
                </p>
                <Button isDisabled>Import Agent (Coming Soon)</Button>
                <Button isDisabled>Marketplace (Coming Soon)</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-grow justify-end pr-2">
        <Tooltip content="Refresh agent instance">
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onClick={() => {
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
            onClick={() => {
              if (selectedAgent) {
                const newAgents = agents.filter(
                  (agent) => agent.name !== selectedAgent.name,
                );
                setAgents(newAgents);
                setSelectedAgent(newAgents[0]);
              }
            }}
          >
            <Icon name="close" className="text-danger" />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}

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
    const [isThinking, setIsThinking] = useState<boolean>(false);

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
      const viewDocuments: ViewDocument[] = [];
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
        datetime: new Date().toLocaleDateString(),
      };

      setIsThinking(false);
      setCurrentChatHistory((prev) => [...prev, agentMessage]);
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
        <div className="flex h-[400px] min-h-[240px] w-full flex-col bg-content1 pb-3">
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
                <BeatLoader />
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
