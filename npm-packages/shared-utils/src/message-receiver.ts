import { IMCMessage, IMCMessageTypeEnum } from "@pulse-editor/types";

export class MessageReceiver {
  private handlerMap: Map<
    IMCMessageTypeEnum,
    (senderWindow: Window, message: IMCMessage) => Promise<any>
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
      IMCMessageTypeEnum,
      (senderWindow: Window, message: IMCMessage) => Promise<any>
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

  public receiveMessage(senderWindow: Window, message: IMCMessage) {
    // Log the message in dev mode
    if (process.env.NODE_ENV === "development") {
      console.log(
        `Module ${this.moduleName} received message from module ${message.from}:\n ${JSON.stringify(
          message
        )}`
      );
    }

    // Abort the task if the message type is Abort
    if (message.type === IMCMessageTypeEnum.Abort) {
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
          if (message.type !== IMCMessageTypeEnum.Acknowledge) {
            this.acknowledgeSender(senderWindow, message.id, result);
          }
        })
        .catch((error) => {
          // Send the error message to the sender
          const errMsg: IMCMessage = {
            id: message.id,
            type: IMCMessageTypeEnum.Error,
            payload: error.message,
            from: this.moduleName,
          };

          senderWindow.postMessage(errMsg, "*");
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
    const message: IMCMessage = {
      id,
      type: IMCMessageTypeEnum.Acknowledge,
      payload: payload,
      from: this.moduleName,
    };
    senderWindow.postMessage(message, "*");
  }
}
