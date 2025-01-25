export type Test = {
  a: string;
  b: number;
};

export type TextFileSelection = {
  lineStart: number;
  lineEnd: number;
  text: string;
};

export type ViewFilePayload = {
  fileContent: string;
  filePath: string;
  selections?: TextFileSelection[];
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
  // A message to notify sender that the message
  // has been received and finished processing
  Finished = "finished",
}

export type ViewBoxMessage = {
  id: string;
  type: ViewBoxMessageTypeEnum;
  payload: string;
};
