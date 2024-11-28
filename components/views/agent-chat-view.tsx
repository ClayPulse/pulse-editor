"use client";

import { useEffect, useRef, useState } from "react";
import ViewLayout from "./layout";
import { ChatMessage } from "@/lib/interface";
import { Avatar, Button, Divider, Input, Tooltip } from "@nextui-org/react";
import Icon from "../icon";

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

export default function AgentChatView() {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>("");

  const chatListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChatHistory([
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
    ]);
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

  return (
    <ViewLayout>
      <div className="flex h-[400px] min-h-[240px] w-full flex-col bg-content1 p-3">
        <div className="flex h-10 w-full flex-shrink-0 items-center rounded-full bg-content2 px-3 text-content2-foreground">
          <Tooltip content="Agent Quick Action: search online">
            <Button isIconOnly variant="light" size="sm">
              <Icon variant="outlined" name="language" />
            </Button>
          </Tooltip>
          <Tooltip content="Agent Quick Action: add test cases">
            <Button isIconOnly variant="light" size="sm">
              <Icon variant="outlined" name="science" />
            </Button>
          </Tooltip>

          <Tooltip content="Agent Quick Action: add comment">
            <Button isIconOnly variant="light" size="sm">
              <Icon variant="outlined" name="add_comment" />
            </Button>
          </Tooltip>

          <Tooltip content="Agent Quick Action: beautify code">
            <Button isIconOnly variant="light" size="sm">
              <Icon variant="outlined" name="auto_fix_high" />
            </Button>
          </Tooltip>
          <div className="h-full px-1 py-2">
            <Divider orientation="vertical" />
          </div>
          <Tooltip content="Add Custom Agent Quick Action">
            <Button isIconOnly variant="light" size="sm">
              <Icon variant="outlined" name="add_box" />
            </Button>
          </Tooltip>
          <Tooltip content="Discover Agent Quick Actions">
            <Button isIconOnly variant="light" size="sm">
              <Icon variant="outlined" name="dashboard_customize" />
            </Button>
          </Tooltip>
        </div>
        <div
          ref={chatListRef}
          className="min-h-0 flex-grow space-y-2 overflow-y-auto px-2 py-1"
        >
          {chatHistory.map((message, index) => (
            <MessageBlock key={index} message={message} />
          ))}
        </div>
        <Input
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
