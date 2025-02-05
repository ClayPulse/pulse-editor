import {
  NotificationTypeEnum,
  ViewBoxMessageTypeEnum,
} from "@pulse-editor/types";
import { messageTimeout } from "@pulse-editor/types/src/constant";
import { MessageSender } from "@pulse-editor/shared-utils";

export default function useNotification() {
  const sender = new MessageSender(window.parent, messageTimeout);

  function openNotification(text: string, type: NotificationTypeEnum) {
    sender.sendMessage(
      ViewBoxMessageTypeEnum.Notification,
      JSON.stringify({
        text,
        type,
      })
    );
  }

  return { openNotification };
}
