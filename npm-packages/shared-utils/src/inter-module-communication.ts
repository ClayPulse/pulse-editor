import {
  messageTimeout,
  ViewBoxMessage,
  ViewBoxMessageTypeEnum,
} from "@pulse-editor/types";
import { MessageReceiver } from "./message-receiver";
import { MessageSender } from "./message-sender";

export class InterModuleCommunication {
  private thisWindow: Window | undefined;
  private otherWindow: Window | undefined;

  /* Wait current module to finish tasks to return a response or acknowledgement. */
  private thisPendingTasks:
    | Map<
        string,
        {
          controller: AbortController;
        }
      >
    | undefined;

  /* Wait the other module to return a response or acknowledgement. */
  private otherPendingMessages:
    | Map<
        string,
        {
          resolve: (result: any) => void;
          reject: () => void;
        }
      >
    | undefined;

  private receiver: MessageReceiver | undefined;
  private sender: MessageSender | undefined;

  private moduleName: string;

  private receiverHandlerMap:
    | Map<
        ViewBoxMessageTypeEnum,
        (senderWindow: Window, message: ViewBoxMessage) => Promise<any>
      >
    | undefined;

  private listener: ((event: MessageEvent) => void) | undefined;

  constructor(moduleName: string) {
    this.moduleName = moduleName;
  }

  public initThisWindow(
    window: Window,
    receiverHandlerMap: Map<
      ViewBoxMessageTypeEnum,
      (senderWindow: Window, message: ViewBoxMessage) => Promise<any>
    >
  ) {
    this.thisWindow = window;
    this.receiverHandlerMap = receiverHandlerMap;
    this.thisPendingTasks = new Map();

    if (receiverHandlerMap.has(ViewBoxMessageTypeEnum.Acknowledge)) {
      throw new Error("Acknowledgement listener should not be added here");
    }

    const receiver = new MessageReceiver(
      receiverHandlerMap,
      this.thisPendingTasks,
      this.moduleName
    );
    this.receiver = receiver;

    this.listener = (event: MessageEvent<ViewBoxMessage>) => {
      if (!receiver) {
        throw new Error(
          "Receiver not initialized at module " + this.moduleName
        );
      }

      const message = event.data;
      const win = event.source as Window;
      receiver.receiveMessage(win, message);
    };
    window.addEventListener("message", this.listener);
  }

  public initOtherWindow(window: Window) {
    this.otherWindow = window;
    this.otherPendingMessages = new Map();

    const sender = new MessageSender(
      window,
      messageTimeout,
      this.otherPendingMessages,
      this.moduleName
    );
    this.sender = sender;

    // Add an acknowledgement listener for sent messages
    if (!this.receiverHandlerMap) {
      throw new Error("You must initialize the current window first.");
    }
    this.receiverHandlerMap.set(
      ViewBoxMessageTypeEnum.Acknowledge,
      async (senderWindow: Window, message: ViewBoxMessage) => {
        const pendingMessage = this.otherPendingMessages?.get(message.id);
        if (pendingMessage) {
          const finishedPayload = message.payload
            ? JSON.parse(message.payload)
            : undefined;
          pendingMessage.resolve(finishedPayload);
          this.otherPendingMessages?.delete(message.id);
        }
      }
    );
  }

  public close() {
    if (this.listener) {
      window.removeEventListener("message", this.listener);
    }
  }

  public sendMessage(
    type: ViewBoxMessageTypeEnum,
    payload?: string,
    abortSignal?: AbortSignal
  ): Promise<any> {
    if (!this.sender) {
      throw new Error("Sender not initialized");
    }

    return this.sender.sendMessage(type, payload, abortSignal);
  }
}
