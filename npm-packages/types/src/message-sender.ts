import { FinishedPayload, ViewBoxMessage, ViewBoxMessageTypeEnum } from "./types";

export class MessageSender {
  private targetWindow: Window;
  private timeout: number;

  private pendingMessages: Map<
    string,
    { resolve: (result: any) => void; reject: () => void }
  >;
  constructor(targetWindow: Window, timeout: number) {
    this.targetWindow = targetWindow;
    this.timeout = timeout;

    this.pendingMessages = new Map();

    this.addFinishedMessageListener();
  }

  sendMessage(
    handlingType: ViewBoxMessageTypeEnum,
    payload: string
  ): Promise<any> {
    // Generate a unique id for the message using timestamp
    const id = new Date().getTime().toString();
    const message: ViewBoxMessage = {
      id,
      type: handlingType,
      payload,
    };

    return new Promise((resolve, reject) => {
      this.pendingMessages.set(id, {
        resolve,
        reject,
      });

      this.targetWindow.postMessage(message, "*");

      setTimeout(() => {
        this.pendingMessages.delete(id);
        reject();
      }, this.timeout);
    });
  }

  private addFinishedMessageListener(): void {
    this.targetWindow.addEventListener("message", (event) => {
      const message = event.data as ViewBoxMessage;
      if (message.type === ViewBoxMessageTypeEnum.Finished) {
        const pendingMessage = this.pendingMessages.get(message.id);
        if (pendingMessage) {
          const finishedPayload: FinishedPayload = JSON.parse(message.payload);
          pendingMessage.resolve(finishedPayload.data);
          this.pendingMessages.delete(message.id);
        }
      }
    });
  }
}
