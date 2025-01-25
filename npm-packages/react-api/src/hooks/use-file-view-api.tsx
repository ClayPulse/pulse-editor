import {
  MessageReceiver,
  MessageSender,
  ViewBoxMessage,
  ViewBoxMessageTypeEnum,
  ViewFilePayload,
} from "@pulse-editor/types";
import { useEffect, useState } from "react";

export default function useFileViewAPI() {
  const [viewFile, setViewFile] = useState<ViewFilePayload | undefined>(undefined);

  const targetWindow = window.parent;

  const receiver = new MessageReceiver(
    new Map([
      // Handle ViewFile message
      [
        ViewBoxMessageTypeEnum.ViewFile,
        (message: ViewBoxMessage) => {
          const file = JSON.parse(message.payload) as ViewFilePayload;

          setViewFile(() => {
            return file;
          });
          return Promise.resolve();
        },
      ],
    ]),
    targetWindow
  );

  // Create a message sender, with a timeout of 5 minutes
  const sender = new MessageSender(targetWindow, 300000);

  useEffect(() => {
    function listener(event: MessageEvent<ViewBoxMessage>) {
      const message = event.data;
      receiver.receiveMessage(message);
    }

    function addMessageListener() {
      window.addEventListener("message", listener);
    }

    function removeMessageListener() {
      window.removeEventListener("message", listener);
    }

    addMessageListener();
    return () => {
      removeMessageListener();
    };
  }, []);


  function updateViewFile(file: ViewFilePayload) {
    // sendMessage({
    //   type: ViewBoxMessageTypeEnum.ViewFile,
    //   payload: file,
    // });
    sender.sendMessage(ViewBoxMessageTypeEnum.ViewFile, JSON.stringify(file));
  }

  function fetch(uri: string, options?: RequestInit): Promise<Response> {
    return sender.sendMessage(
      ViewBoxMessageTypeEnum.Fetch,
      JSON.stringify({ uri, options })
    );
  }

  return {
    viewFile,
    updateViewFile,
    fetch,
  };
}
