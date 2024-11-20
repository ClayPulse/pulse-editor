export interface MenuStates {
  isDrawingMode: boolean;
  isDrawHulls: boolean;
  isDownloadClip: boolean;
  isRecording: boolean;

  // Settings
  settings?: Settings;
}

export interface Settings {
  sttProvider?: string;
  llmProvider?: string;
  ttsProvider?: string;

  sttModel?: string;
  llmModel?: string;
  ttsModel?: string;

  sttAPIKey?: string;
  llmAPIKey?: string;
  ttsAPIKey?: string;

  isUsePassword?: boolean;
  ttl?: number;
}

export interface DrawnLine {
  points: {
    x: number;
    y: number;
  }[];
}

export interface DrawingInformation {
  lineStart: number;
  lineEnd: number;
  text: string;
}

export interface CodeCompletionInstruction {
  text?: string;
  audio?: Blob;
}

export interface CodeCompletionResult {
  text: string;
  audio?: Blob;
}
