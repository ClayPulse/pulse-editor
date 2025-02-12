/* Inter Module Communication messages */
export enum IMCMessageTypeEnum {
  // Update view file
  WriteViewFile = "write-view-file",
  // View file change
  ViewFileChange = "view-file-change",
  // Network fetch request
  Fetch = "fetch",
  // Send notification
  Notification = "notification",
  // Get theme
  GetTheme = "get-theme",

  /* Agents */
  // Install agent
  InstallAgent = "install-agent",
  // Execute agent method
  RunAgentMethod = "run-agent-method",

  /* Modality tools */
  OCR = "ocr",

  // Notify Pulse that extension window is available
  Ready = "ready",
  // Notify Pulse that extension has finished loading
  Loaded = "loaded",
  // A message to notify sender that the message
  // has been received and finished processing
  Acknowledge = "acknowledge",
  // Notify abort
  Abort = "abort",
  // Error
  Error = "error",
}

export type IMCMessage = {
  id: string;
  from: string;
  type: IMCMessageTypeEnum;
  payload?: any;
};

// IMC receiver handler map
export type ReceiverHandlerMap = Map<
  IMCMessageTypeEnum,
  {
    (
      senderWindow: Window,
      message: IMCMessage,
      abortSignal?: AbortSignal
    ): Promise<any>;
  }
>;

/* File view */
export type TextFileSelection = {
  lineStart: number;
  lineEnd: number;
  text: string;
};

export type FileViewModel = {
  fileContent: string;
  filePath: string;
  selections?: TextFileSelection[];
  isActive: boolean;
};

/* Fetch API */
export type FetchPayload = {
  uri: string;
  options?: RequestInit;
};

/* Notification */
export enum NotificationTypeEnum {
  Success = "success",
  Error = "error",
  Info = "info",
  Warning = "warning",
}

/* Extension settings */
export enum ExtensionTypeEnum {
  FileView = "file-view",
  TerminalView = "terminal-view",
}

export type ExtensionConfig = {
  id: string;
  version: string;
  author: string;
  displayName?: string;
  description?: string;
  extensionType?: ExtensionTypeEnum;
  fileTypes?: string[];
  preview?: string;
};

/* Agent config */
export type Agent = {
  name: string;
  version: string;
  systemPrompt: string;
  availableMethods: AgentMethod[];
  LLMConfig: LLMConfig;
  description: string;
};

export type AgentMethod = {
  name: string;
  parameters: Record<string, AgentVariable>;
  prompt: string;
  returns: Record<string, AgentVariable>;
  // If this config does not exist, use the class's LLMConfig
  LLMConfig?: LLMConfig;
};

export type AgentVariable = {
  type: AgentVariableType;
  // Describe the variable for LLM to better understand it
  description: string;
};

export type AgentVariableType =
  | "string"
  | "number"
  | "boolean"
  | AgentVariableTypeArray;

type AgentVariableTypeArray = {
  size: number;
  elementType: AgentVariableType;
};

/* AI settings */
export type LLMConfig = {
  provider: string;
  modelName: string;
  temperature: number;
};
