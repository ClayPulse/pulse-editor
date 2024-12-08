"use client";

import CodeEditorView, {
  CodeEditorViewRef,
} from "@/components/views/code-editor-view";
import { useMicVAD, utils } from "@/lib/hooks/use-mic-vad";
import { BaseLLM, getModelLLM } from "@/lib/llm/llm";
import { BaseSTT, getModelSTT } from "@/lib/stt/stt";
import { useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { CodeEditorAgent } from "@/lib/agent/code-editor-agent";
import { BaseTTS, getModelTTS } from "@/lib/tts/tts";
import AgentChatTerminalView from "@/components/views/agent-chat-terminal-view";
import { AnimatePresence, motion } from "framer-motion";
import { ViewDocument, ViewRef } from "@/lib/types";
import EditorToolbar from "@/components/editor-toolbar";
import { EditorContext } from "@/components/providers/editor-context-provider";

export default function Home() {
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  // const viewMap = useRef<Map<string, ViewRef | null>>(new Map());
  const editorContext = useContext(EditorContext);

  const sttModelRef = useRef<BaseSTT | undefined>(undefined);
  const llmModelRef = useRef<BaseLLM | undefined>(undefined);
  const ttsModelRef = useRef<BaseTTS | undefined>(undefined);

  // TODO: Use a timer to stop recorder if no speech is detected for more than 30 seconds

  const [isProcessing, setIsProcessing] = useState(false);
  const vad = useMicVAD({
    startOnLoad: false,
    ortConfig(ort) {
      ort.env.wasm.wasmPaths = "/vad/";
    },
    workletURL: "/vad/vad.worklet.bundle.min.js",
    modelURL: "/vad/silero_vad.onnx",
    onSpeechStart: () => {
      if (!isProcessing) {
        editorContext?.setEditorStates((prev) => ({
          ...prev,
          isListening: true,
        }));
      }
    },
    onSpeechEnd: (audio) => {
      if (!isProcessing) {
        setIsProcessing(true);
        const wavBuffer = utils.encodeWAV(audio);
        const blob = new Blob([wavBuffer], { type: "audio/wav" });
        console.log("Speech end\n", blob);

        if (!llmModelRef.current) {
          toast.error("LLM model not loaded");
          return;
        }
        const agent = new CodeEditorAgent(
          sttModelRef.current,
          llmModelRef.current,
          ttsModelRef.current,
        );
        const codeEditor = editorContext?.getViewById("1") as CodeEditorViewRef;
        const viewDocument = codeEditor?.getViewDocument();
        editorContext?.setEditorStates((prev) => ({
          ...prev,
          isListening: false,
          isThinking: true,
        }));
        agent
          .generateAgentCompletion(
            viewDocument?.fileContent || "",
            viewDocument?.selections || [],
            {
              audio: blob,
            },
          )
          .then((result) => {
            const changes = agent.getLineChanges(result.text.codeCompletion);
            editorContext?.setEditorStates((prev) => ({
              ...prev,
              isThinking: false,
            }));

            // Apply changes
            const codeEditor = editorContext?.getViewById(
              "1",
            ) as CodeEditorViewRef;
            codeEditor?.applyChanges(changes);

            // Play the audio in the blob
            if (result.audio) {
              const audio = new Audio(URL.createObjectURL(result.audio));
              audio.onended = () => {
                console.log("Audio ended");
                editorContext?.setEditorStates((prev) => ({
                  ...prev,
                  isSpeaking: false,
                }));
                setIsProcessing(false);
              };
              editorContext?.setEditorStates((prev) => ({
                ...prev,
                isSpeaking: true,
              }));
              audio.play();
              return;
            }
            setIsProcessing(false);
          });
      }
    },
  });

  // Load models
  useEffect(() => {
    if (editorContext?.persistSettings) {
      // Load STT
      if (
        editorContext?.persistSettings.sttAPIKey &&
        editorContext?.persistSettings.sttProvider &&
        editorContext?.persistSettings.sttModel
      ) {
        const model = getModelSTT(
          editorContext?.persistSettings.sttAPIKey,
          editorContext?.persistSettings.sttProvider,
          editorContext?.persistSettings.sttModel,
        );
        sttModelRef.current = model;
      } else {
        toast.error("Please set STT Provider, Model and API key in settings");
      }

      // Load LLM
      if (
        editorContext?.persistSettings.llmAPIKey &&
        editorContext?.persistSettings.llmProvider &&
        editorContext?.persistSettings.llmModel
      ) {
        const model = getModelLLM(
          editorContext?.persistSettings.llmAPIKey,
          editorContext?.persistSettings.llmProvider,
          editorContext?.persistSettings.llmModel,
          0.85,
        );
        llmModelRef.current = model;
      } else {
        toast.error("Please set LLM Provider, Model and API key in settings");
      }

      // Load TTS
      if (
        editorContext?.persistSettings.ttsAPIKey &&
        editorContext?.persistSettings.ttsProvider &&
        editorContext?.persistSettings.ttsModel &&
        editorContext?.persistSettings.ttsVoice
      ) {
        const model = getModelTTS(
          editorContext?.persistSettings.ttsAPIKey,
          editorContext?.persistSettings.ttsProvider,
          editorContext?.persistSettings.ttsModel,
          editorContext?.persistSettings.ttsVoice,
        );
        ttsModelRef.current = model;
      } else {
        toast.error("Please set TTS Provider, Model and API key in settings");
      }
    }
  }, [editorContext?.persistSettings]);

  // Toggle recording
  useEffect(() => {
    if (editorContext?.editorStates?.isRecording) {
      vad.start();
    } else {
      vad.stop();
    }
  }, [editorContext?.editorStates, vad]);

  // useEffect(() => {
  //   const url = "/test.tsx";
  //   if (url) {
  //     fetch(url)
  //       .then((res) => res.text())
  //       .then((text) => {
  //         const viewId = "1";

  //         // Init a new viewDocument
  //         const viewDocument: ViewDocument = {
  //           fileContent: text,
  //           filePath: url,
  //         };

  //         // Get the code editor view
  //         const codeEditor = editorContext?.getViewById(
  //           viewId,
  //         ) as CodeEditorViewRef;

  //         // Set the viewDocument
  //         codeEditor?.setViewDocument(viewDocument);
  //       });
  //   }
  // }, []);

  return (
    <div className="flex h-full w-full flex-col">
      <EditorToolbar />

      <div className="flex h-full w-full flex-col p-1">
        <div className="flex h-full w-full flex-col items-start justify-between space-y-1.5 overflow-hidden rounded-xl bg-default p-2">
          <div
            className={`min-h-0 w-full flex-grow`}
            style={{
              cursor:
                editorContext?.editorStates?.isDrawing && !isCanvasReady
                  ? "wait"
                  : "auto",
            }}
          >
            <CodeEditorView
              ref={(ref) => {
                if (ref) editorContext?.addView("1", ref);
              }}
              width="100%"
              height="100%"
              isDrawingMode={editorContext?.editorStates?.isDrawing}
              isDownloadClip={editorContext?.editorStates?.isDownloadClip}
              isDrawHulls={editorContext?.editorStates?.isDrawHulls}
              setIsCanvasReady={setIsCanvasReady}
            />
          </div>
          <AnimatePresence>
            {editorContext?.editorStates?.isOpenChatView && (
              <motion.div
                className="h-full min-h-[60%] w-full pb-14"
                // Enter from bottom and exit to bottom
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
              >
                <AgentChatTerminalView
                  ref={(ref) => {
                    if (ref) editorContext?.addView("2", ref);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
