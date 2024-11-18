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

export interface MenuStates {
  isDrawingMode: boolean;
  isDrawHulls: boolean;
  isDownloadClip: boolean;
  isRecording: boolean;
}

export interface CodeCompletionInstruction {
  text?: string;
  audio?: Blob;
}

export interface CodeCompletionResult {
  text: string;
  audio?: Blob;
}
