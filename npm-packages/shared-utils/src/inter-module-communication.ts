import {
  messageTimeout,
  IMCMessage,
  IMCMessageTypeEnum,
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
        IMCMessageTypeEnum,
        (senderWindow: Window, message: IMCMessage) => Promise<any>
      >
    | undefined;

  private listener: ((event: MessageEvent) => void) | undefined;

  constructor(moduleName: string) {
    this.moduleName = moduleName;
  }

  public initThisWindow(
    window: Window,
    receiverHandlerMap: Map<
      IMCMessageTypeEnum,
      (senderWindow: Window, message: IMCMessage) => Promise<any>
    >
  ) {
    this.thisWindow = window;
    this.receiverHandlerMap = receiverHandlerMap;
    this.thisPendingTasks = new Map();

    if (receiverHandlerMap.has(IMCMessageTypeEnum.Acknowledge)) {
      throw new Error("Acknowledgement listener should not be added here");
    }

    const receiver = new MessageReceiver(
      receiverHandlerMap,
      this.thisPendingTasks,
      this.moduleName
    );
    this.receiver = receiver;

    this.listener = (event: MessageEvent<IMCMessage>) => {
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
    console.log("Adding IMC listener in " + this.moduleName);
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
      IMCMessageTypeEnum.Acknowledge,
      async (senderWindow: Window, message: IMCMessage) => {
        const pendingMessage = this.otherPendingMessages?.get(message.id);
        if (pendingMessage) {
          pendingMessage.resolve(message.payload);
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

  public async sendMessage(
    type: IMCMessageTypeEnum,
    payload?: any,
    abortSignal?: AbortSignal
  ): Promise<any> {
    if (!this.sender) {
      throw new Error("Sender not initialized");
    }

    return await this.sender.sendMessage(type, payload, abortSignal);
  }
}
