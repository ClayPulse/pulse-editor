import { MessageReceiver } from "@pulse-editor/shared-utils";
import { ViewBoxMessage, ViewBoxMessageTypeEnum } from "@pulse-editor/types";
import { useEffect, useState } from "react";

export default function useTheme() {
  const [theme, setTheme] = useState<string>("light");
  const receiverHandlerMap = new Map<
    ViewBoxMessageTypeEnum,
    (message: ViewBoxMessage) => Promise<void>
  >();

  receiverHandlerMap.set(
    ViewBoxMessageTypeEnum.ViewFile,
    async (message: ViewBoxMessage) => {
      const payload = JSON.parse(message.payload);
      setTheme(payload.theme);
    }
  );

  const receiver = new MessageReceiver(receiverHandlerMap, window.parent);

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

  return {
    theme,
  };
}
