import {
  FinishedPayload,
  ViewBoxMessage,
  ViewBoxMessageTypeEnum,
} from "@pulse-editor/types";

export class MessageReceiver {
  // handlingType: ViewBoxMessageTypeEnum;
  // onReceiveMessage: (message: ViewBoxMessage) => Promise<void>;
  private listenerMap: Map<
    ViewBoxMessageTypeEnum,
    (message: ViewBoxMessage) => Promise<any>
  >;
  private targetWindow: Window;
  private pendingTasks: Map<
    string,
    {
      controller: AbortController;
    }
  >;

  constructor(
    listenerMap: Map<
      ViewBoxMessageTypeEnum,
      (message: ViewBoxMessage) => Promise<void>
    >,
    targetWindow: Window
  ) {
    this.listenerMap = listenerMap;
    this.targetWindow = targetWindow;

    this.pendingTasks = new Map();
  }

  receiveMessage(message: ViewBoxMessage) {
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

    const handler = this.listenerMap.get(message.type);
    if (handler) {
      const controller = new AbortController();
      const signal = controller.signal;

      const promise = handler(message);
      this.pendingTasks.set(message.id, {
        controller,
      });
      promise
        .then((result) => {
          // Don't send the result if the task has been aborted
          if (signal.aborted) return;

          const payload: FinishedPayload = {
            status: "Task completed",
            data: result,
          };
          this.notifySenderFinished(message.id, payload);
        })
        .finally(() => {
          this.pendingTasks.delete(message.id);
        });
    }
  }

  private notifySenderFinished(id: string, result: FinishedPayload): void {
    const message: ViewBoxMessage = {
      id,
      type: ViewBoxMessageTypeEnum.Acknowledge,
      payload: JSON.stringify(result),
    };
    this.targetWindow.postMessage(message, "*");
  }
}
