"use client";

import { useEffect, useRef, useState } from "react";
import ViewLayout from "./layout";
import { AgentConfig, ChatMessage } from "@/lib/interface";
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

const pseudoChatHistory = [
  {
    from: "Agent",
    content: `Figma ipsum component variant main layer. Asset hand reesizing component shadow blur connection blur overflow asset. Thumbnail connection inspect content prototype editor image. Reesizing stroke team main pixel slice. Clip horizontal stroke comment inspect star list figjam. Undo team stroke device font team. Ellipse follower project bold edit draft editor polygon arrange. Vector overflow export edit outline. Mask bullet bold vertical line draft list auto ipsum draft. Pixel polygon italic auto flatten hand.
Ellipse auto content union library union. Object link export undo frame image image. Auto outline flows draft rotate distribute flows follower component flatten. Scale draft comment layer strikethrough. Plugin clip background create draft component figjam. Image device fill figjam flows content. Vertical slice pencil background underline layer. Vector team clip vertical bullet horizontal variant rotate. Component line figjam main edit link.`,
    datetime: "2021-10-10 10:00:00",
  },
  {
    from: "User",
    content: `Figma ipsum component variant main layer. Asset hand reesizing component shadow blur connection blur overflow asset. Thumbnail connection inspect content prototype editor image. Reesizing stroke team main pixel slice. Clip horizontal stroke comment inspect star list figjam. Undo team stroke device font team. Ellipse follower project bold edit draft editor polygon arrange. Vector overflow export edit outline. Mask bullet bold vertical line draft list auto ipsum draft. Pixel polygon italic auto flatten hand.
Ellipse auto content union library union. Object link export undo frame image image. Auto outline flows draft rotate distribute flows follower component flatten. Scale draft comment layer strikethrough. Plugin clip background create draft component figjam. Image device fill figjam flows content. Vertical slice pencil background underline layer. Vector team clip vertical bullet horizontal variant rotate. Component line figjam main edit link.`,
    datetime: "2021-10-10 10:00:00",
  },
  {
    from: "Agent",
    content: `Figma ipsum component variant main layer. Asset hand reesizing component shadow blur connection blur overflow asset. Thumbnail connection inspect content prototype editor image. Reesizing stroke team main pixel slice. Clip horizontal stroke comment inspect star list figjam. Undo team stroke device font team. Ellipse follower project bold edit draft editor polygon arrange. Vector overflow export edit outline. Mask bullet bold vertical line draft list auto ipsum draft. Pixel polygon italic auto flatten hand.
Ellipse auto content union library union. Object link export undo frame image image. Auto outline flows draft rotate distribute flows follower component flatten. Scale draft comment layer strikethrough. Plugin clip background create draft component figjam. Image device fill figjam flows content. Vertical slice pencil background underline layer. Vector team clip vertical bullet horizontal variant rotate. Component line figjam main edit link.`,
    datetime: "2021-10-10 10:00:00",
  },
  {
    from: "User",
    content: `Figma ipsum component variant main layer. Asset hand reesizing component shadow blur connection blur overflow asset. Thumbnail connection inspect content prototype editor image. Reesizing stroke team main pixel slice. Clip horizontal stroke comment inspect star list figjam. Undo team stroke device font team. Ellipse follower project bold edit draft editor polygon arrange. Vector overflow export edit outline. Mask bullet bold vertical line draft list auto ipsum draft. Pixel polygon italic auto flatten hand.
Ellipse auto content union library union. Object link export undo frame image image. Auto outline flows draft rotate distribute flows follower component flatten. Scale draft comment layer strikethrough. Plugin clip background create draft component figjam. Image device fill figjam flows content. Vertical slice pencil background underline layer. Vector team clip vertical bullet horizontal variant rotate. Component line figjam main edit link.`,
    datetime: "2021-10-10 10:00:00",
  },
];

const defaultAgents: AgentConfig[] = [
  {
    name: "Online Search Agent",
    icon: "language",
    tooltip: "An agent searches information online",
    instruction: "Search for information online",
  },
  {
    name: "Test Agent",
    icon: "science",
    tooltip: "An agent adds test cases",
    instruction: "Write test cases for the given code",
  },
  {
    name: "Add Comment Agent",
    icon: "add_comment",
    tooltip: "An agent adds comments",
    instruction: "Add comments to the code",
  },
  {
    name: "Beautify Code Agent",
    icon: "auto_fix_high",
    tooltip: "An agent beautifies the code",
    instruction: "Beautify the code",
  },
];

export default function AgentChatTerminalView() {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const chatListRef = useRef<HTMLDivElement>(null);

  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentConfig | undefined>(
    undefined,
  );

  useEffect(() => {
    setChatHistory(pseudoChatHistory);
    setAgents(defaultAgents);
  }, []);

  useEffect(() => {
    if (chatListRef.current) {
      console.log(chatListRef.current.scrollHeight);
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, [chatHistory]);

  function onInputSubmit(content: string) {
    const newMessage: ChatMessage = {
      from: "User",
      content: content,
      datetime: new Date().toISOString(),
    };

    setChatHistory([...chatHistory, newMessage]);

    setInputValue("");
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
                    <Icon variant="outlined" name={agent.icon || "smart_toy"} />
                    <p>{agent.name}</p>
                  </div>
                }
                className="px-2"
              ></Tab>
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
            <p>{message.content}</p>
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
          {chatHistory.map((message, index) => (
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
}
