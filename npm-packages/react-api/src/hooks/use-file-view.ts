import { MessageReceiver, MessageSender } from "@pulse-editor/shared-utils";
import {
  ViewBoxMessage,
  ViewBoxMessageTypeEnum,
  FileViewModel,
} from "@pulse-editor/types";
import { useEffect, useState } from "react";
import { messageTimeout } from "@pulse-editor/types/src/constant";

export default function useFileView() {
  const [viewFile, setViewFile] = useState<FileViewModel | undefined>(
    undefined
  );
  const [isLoaded, setIsLoaded] = useState(false);

  const targetWindow = window.parent;

  const receiverHandlerMap = new Map<
    ViewBoxMessageTypeEnum,
    (message: ViewBoxMessage) => Promise<void>
  >();

  receiverHandlerMap.set(
    ViewBoxMessageTypeEnum.ViewFile,
    async (message: ViewBoxMessage) => {
      const payload = JSON.parse(message.payload) as FileViewModel;
      console.log("Received view file message", payload);
      setViewFile(payload);
    }
  );

  const receiver = new MessageReceiver(receiverHandlerMap, targetWindow);

  // Create a message sender, with a timeout of 5 minutes
  const sender = new MessageSender(targetWindow, messageTimeout);

  useEffect(() => {
    function listener(event: MessageEvent<ViewBoxMessage>) {
      const message = event.data;
      console.log("Received message in iframe", message);
      receiver.receiveMessage(message);
    }

    function addMessageListener() {
      window.addEventListener("message", listener);
    }

    function removeMessageListener() {
      window.removeEventListener("message", listener);
    }

    addMessageListener();
    sender.sendMessage(ViewBoxMessageTypeEnum.Ready, "");
    console.log("Sent ready message");
    return () => {
      removeMessageListener();
    };
  }, []);

  useEffect(() => {
    sender.sendMessage(
      ViewBoxMessageTypeEnum.Loading,
      JSON.stringify({ isLoaded: isLoaded })
    );
  }, [isLoaded]);

  function updateViewFile(file: FileViewModel) {
    sender.sendMessage(ViewBoxMessageTypeEnum.ViewFile, JSON.stringify(file));
  }

  return {
    viewFile,
    updateViewFile,
    setIsLoaded,
  };
}
