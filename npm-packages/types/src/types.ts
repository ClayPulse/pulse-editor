export type Test = {
  a: string;
  b: number;
};

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

export type FetchPayload = {
  uri: string;
  options?: RequestInit;
};

/* Messages */
export enum ViewBoxMessageTypeEnum {
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
  // Get agent config
  GetAgentConfig = "get-agent-config",
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
}

export type ViewBoxMessage = {
  id: string;
  from: string;
  type: ViewBoxMessageTypeEnum;
  payload?: string;
};

export enum NotificationTypeEnum {
  Success = "success",
  Error = "error",
  Info = "info",
  Warning = "warning",
}

export type SelectionInformation = {
  lineStart: number;
  lineEnd: number;
  text: string;
};

export type AgentConfig = {
  name: string;
  // instanceId: string;
  // version: string;

  // TODO: add parameters and return types
  availableMethods: string[];
};

export type AgentMethodResult = {
  status: string;
  data: any;
};

export enum ExtensionTypeEnum {
  FileView = "file-view",
  TerminalView = "terminal-view",
}

export type ExtensionConfig = {
  id: string;
  version: string;
  displayName?: string;
  description?: string;
  extensionType?: ExtensionTypeEnum;
  fileTypes?: string[];
  preview?: string;
};
