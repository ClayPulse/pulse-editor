import { MessageSender } from "@pulse-editor/shared-utils";
import { messageTimeout } from "@pulse-editor/types/src/constant";
import { ViewBoxMessageTypeEnum } from "@pulse-editor/types";

export default function useOCR() {
  const sender = new MessageSender(window.parent, messageTimeout);

  async function recognizeText(uri: string): Promise<string> {
    // Send the message to the extension
    const result = await sender.sendMessage(
      ViewBoxMessageTypeEnum.OCR,
      JSON.stringify({ uri })
    );

    return result.payload.text;
  }

  return {
    recognizeText,
  };
}
