import { MessageSender } from "@pulse-editor/shared-utils";
import { messageTimeout } from "@pulse-editor/types/src/constant";
import { ViewBoxMessageTypeEnum } from "@pulse-editor/types";

export default function useFetch() {
  const sender = new MessageSender(window.parent, messageTimeout);

  function fetch(uri: string, options?: RequestInit): Promise<Response> {
    return sender.sendMessage(
      ViewBoxMessageTypeEnum.Fetch,
      JSON.stringify({ uri, options })
    );
  }

  return { fetch };
}
