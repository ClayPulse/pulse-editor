import {
  FinishedPayload,
  ViewBoxMessage,
  ViewBoxMessageTypeEnum,
} from "./types";

export class MessageReceiver {
  // handlingType: ViewBoxMessageTypeEnum;
  // onReceiveMessage: (message: ViewBoxMessage) => Promise<void>;
  private listenerMap: Map<
    ViewBoxMessageTypeEnum,
    (message: ViewBoxMessage) => Promise<any>
  >;
  private targetWindow: Window;

  constructor(
    listenerMap: Map<
      ViewBoxMessageTypeEnum,
      (message: ViewBoxMessage) => Promise<void>
    >,
    targetWindow: Window
  ) {
    this.listenerMap = listenerMap;
    this.targetWindow = targetWindow;
  }

  receiveMessage(message: ViewBoxMessage) {
    const handler = this.listenerMap.get(message.type);

    if (handler) {
      handler(message).then((result) => {
        const payload: FinishedPayload = { status: "Task completed", data: result };
        this.notifySenderFinished(message.id, payload);
      });
    }
  }

  private notifySenderFinished(id: string, result: FinishedPayload): void {
    const message: ViewBoxMessage = {
      id,
      type: ViewBoxMessageTypeEnum.Finished,
      payload: JSON.stringify(result),
    };
    this.targetWindow.postMessage(message, "*");
  }
}
