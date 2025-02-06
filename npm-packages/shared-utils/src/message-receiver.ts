import { ViewBoxMessage, ViewBoxMessageTypeEnum } from "@pulse-editor/types";

export class MessageReceiver {
  private handlerMap: Map<
    ViewBoxMessageTypeEnum,
    (senderWindow: Window, message: ViewBoxMessage) => Promise<any>
  >;
  private pendingTasks: Map<
    string,
    {
      controller: AbortController;
    }
  >;
  private moduleName: string;

  constructor(
    listenerMap: Map<
      ViewBoxMessageTypeEnum,
      (senderWindow: Window, message: ViewBoxMessage) => Promise<any>
    >,
    pendingTasks: Map<
      string,
      {
        controller: AbortController;
      }
    >,
    moduleInfo: string
  ) {
    this.handlerMap = listenerMap;
    this.pendingTasks = pendingTasks;
    this.moduleName = moduleInfo;
  }

  public receiveMessage(senderWindow: Window, message: ViewBoxMessage) {
    // Log the message
    console.log(
      `Module ${this.moduleName} received message from module ${message.from}:\n ${JSON.stringify(
        message
      )}`
    );

    // Abort the task if the message type is Abort
    if (message.type === ViewBoxMessageTypeEnum.Abort) {
      const id = message.id;
      const pendingTask = this.pendingTasks.get(id);

      if (pendingTask) {
        pendingTask.controller.abort();
        this.pendingTasks.delete(id);
      }

      return;
    }

    const handler = this.handlerMap.get(message.type);
    if (handler) {
      const controller = new AbortController();
      const signal = controller.signal;

      const promise = handler(senderWindow, message);
      this.pendingTasks.set(message.id, {
        controller,
      });
      promise
        .then((result) => {
          // Don't send the result if the task has been aborted
          if (signal.aborted) return;

          // Acknowledge the sender with the result if the message type is not Acknowledge
          if (message.type !== ViewBoxMessageTypeEnum.Acknowledge) {
            this.acknowledgeSender(senderWindow, message.id, result);
          }
        })
        .finally(() => {
          this.pendingTasks.delete(message.id);
        });
    }
  }

  private acknowledgeSender(
    senderWindow: Window,
    id: string,
    payload: any
  ): void {
    const message: ViewBoxMessage = {
      id,
      type: ViewBoxMessageTypeEnum.Acknowledge,
      payload: JSON.stringify(payload),
      from: this.moduleName,
    };
    senderWindow.postMessage(message, "*");
  }
}
