import { Dispatch, ForwardedRef, Ref, RefObject, SetStateAction } from "react";
import { ViewManager } from "./views/view-manager";
import { AIModelConfig } from "./ai-model-config";
import { ViewTypeEnum } from "./views/available-views";

export type EditorStates = {
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

  project?: string;
  projectContent?: FileSystemObject[];
  projectsInfo?: ProjectInfo[];

  explorerSelectedNodeRefs: RefObject<TreeViewNodeRef | null>[];

  pressedKeys: string[];
};

export type PersistentSettings = {
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

  projectHomePath?: string;
};

export type DrawnLine = {
  points: {
    x: number;
    y: number;
  }[];
};

export type SelectionInformation = {
  lineStart: number;
  lineEnd: number;
  text: string;
};

export type CodeCompletionInstruction = {
  text?: string;
  audio?: Blob;
};

export type CodeCompletionResult = {
  text: {
    codeCompletion: string;
    explanation: string;
  };
  audio?: Blob;
};

export type InlineSuggestionResult = {
  snippets: string[];
};

export type ViewDocument = {
  fileContent: string;
  filePath: string;
  selections?: SelectionInformation[];
  suggestedLines?: LineChange[];
};

export type LineChange = {
  // Index starts from 1
  index: number;
  content: string;
  status: "added" | "deleted" | "modified";
};

export type ChatMessage = {
  from: string;
  content: string;
  datetime: string;
};

export type AgentConfig = {
  name: string;
  icon?: string;
  description?: string;
  prompt: string;
};

export type ViewRef = {
  getType: () => ViewTypeEnum;
  updateViewDocument: (viewDocument: Partial<ViewDocument>) => void;
};

export type EditorContextType = {
  editorStates: EditorStates;
  setEditorStates: Dispatch<SetStateAction<EditorStates>>;
  persistSettings: PersistentSettings | undefined;
  setPersistSettings: Dispatch<SetStateAction<PersistentSettings | undefined>>;
  viewManager: ViewManager | undefined;
  setViewManager: Dispatch<SetStateAction<ViewManager | undefined>>;
  // notifyViewManagerUpdate: () => void;
  aiModelConfig: AIModelConfig;
};

/* File system */
export type OpenFileDialogConfig = {
  isFolder?: boolean;
  isMultiple?: boolean;
};

export type SaveFileDialogConfig = {
  extension?: string;
};

export type FileSystemObject = {
  name: string;
  uri: string;
  extension?: string;
  file?: File;
  isFolder: boolean;
  subDirItems?: FileSystemObject[];
};

export type ProjectInfo = {
  name: string;
  ctime: Date;
};

export type TreeViewGroupRef = {
  startCreatingNewFolder: () => void;
  startCreatingNewFile: () => void;
  cancelCreating: () => void;
};

export type TreeViewNodeRef = {
  getParentGroupRef: () => TreeViewGroupRef | null;
  getChildGroupRef: () => TreeViewGroupRef | null;
  isFolder: () => boolean;
};

export type ContextMenuState = {
  x: number;
  y: number;
  isOpen: boolean;
};
