import { Dispatch, SetStateAction } from "react";
import { ViewManager } from "./views/view-manager";
import { AIModelConfig } from "./ai-model-config";
import { ViewTypeEnum } from "./views/available-views";

export interface EditorStates {
  // Selection by drawing
  isDrawing: boolean;
  isDrawHulls: boolean;
  isDownloadClip: boolean;

  // Inline/popover chat
  isInlineChatEnabled: boolean;

  // Open chat view
  isChatViewOpen: boolean;

  // Voice agent
  isRecording: boolean;
  isListening: boolean;
  isThinking: boolean;
  isSpeaking: boolean;
  isMuted: boolean;

  // Toolbar
  isToolbarOpen: boolean;
}

export interface PersistSettings {
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
  isPasswordSet?: boolean;
  password?: string;
  ttl?: number;

  ttsVoice?: string;
}

export interface DrawnLine {
  points: {
    x: number;
    y: number;
  }[];
}

export interface SelectionInformation {
  lineStart: number;
  lineEnd: number;
  text: string;
}

export interface CodeCompletionInstruction {
  text?: string;
  audio?: Blob;
}

export interface CodeCompletionResult {
  text: {
    codeCompletion: string;
    explanation: string;
  };
  audio?: Blob;
}

export interface InlineSuggestionResult {
  snippets: string[];
}

export interface ViewDocument {
  fileContent: string;
  filePath: string;
  selections?: SelectionInformation[];
  suggestedLines?: LineChange[];
}

export interface LineChange {
  // Index starts from 1
  index: number;
  content: string;
  status: "added" | "deleted" | "modified";
}

export interface ChatMessage {
  from: string;
  content: string;
  datetime: string;
}

export interface AgentConfig {
  name: string;
  icon?: string;
  description?: string;
  prompt: string;
}

export type ViewRef = {
  getType: () => ViewTypeEnum;
  updateViewDocument: (viewDocument: Partial<ViewDocument>) => void;
};

export type Folder = {
  file: File;
  uri: string;
}[];

export interface EditorContextType {
  editorStates: EditorStates;
  setEditorStates: Dispatch<SetStateAction<EditorStates>>;
  persistSettings: PersistSettings | undefined;
  setPersistSettings: Dispatch<SetStateAction<PersistSettings | undefined>>;
  viewManager: ViewManager | undefined;
  setViewManager: Dispatch<SetStateAction<ViewManager | undefined>>;
  // notifyViewManagerUpdate: () => void;
  aiModelConfig: AIModelConfig;
}
