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

export type FinishedPayload = {
  status: string;
  data: any;
};

/* Messages */
export enum ViewBoxMessageTypeEnum {
  // View file
  ViewFile = "view-file",
  // Fetch request
  Fetch = "fetch",
  // Send notification
  Notification = "notification",
  // Loading status
  Loading = "loading",

  /* Agents */
  // Get agent config
  GetAgentConfig = "get-agent-config",
  // Execute agent method
  RunAgentMethod = "run-agent-method",

  /* Modality tools */
  OCR = "ocr",

  // Notify Pulse that hook is ready
  Ready = "ready",
  // A message to notify sender that the message
  // has been received and finished processing
  Acknowledge = "acknowledge",
  // Notify abort
  Abort = "abort",
}

export type ViewBoxMessage = {
  id: string;
  type: ViewBoxMessageTypeEnum;
  payload: string;
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
