"use client";

import { CodeEditorViewRef } from "@/components/views/code-editor-view";
import { useMicVAD, utils } from "@/lib/hooks/use-mic-vad";
import { BaseLLM } from "@/lib/llm/llm";
import { BaseSTT } from "@/lib/stt/stt";
import { useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { CodeEditorAgent } from "@/lib/agent/code-editor-agent";
import { BaseTTS } from "@/lib/tts/tts";
import EditorToolbar from "@/components/editor-toolbar";
import { EditorContext } from "@/components/providers/editor-context-provider";
import ViewDisplayArea from "@/components/view-display-area";

export default function Home() {
  const editorContext = useContext(EditorContext);

  // TODO: Use a timer to stop recorder if no speech is detected for more than 30 seconds
  const isProcessingRef = useRef(false);
  const vad = useMicVAD({
    startOnLoad: false,
    ortConfig(ort) {
      ort.env.wasm.wasmPaths = "/vad/";
    },
    workletURL: "/vad/vad.worklet.bundle.min.js",
    modelURL: "/vad/silero_vad.onnx",
    onSpeechStart: () => {
      if (!isProcessingRef.current) {
        const sttModel = editorContext?.aiModelConfig.getSTTModel();
        const llmModel = editorContext?.aiModelConfig.getLLMModel();
        const ttsModel = editorContext?.aiModelConfig.getTTSModel();
        let isConfigured = true;
        if (!sttModel) {
          toast.error("STT model is not configured in settings.");
          isConfigured = false;
        }
        if (!llmModel) {
          toast.error("LLM model is not configured in settings.");
          isConfigured = false;
        }
        if (!ttsModel) {
          toast.error("TTS model is not configured in settings.");
          isConfigured = false;
        }

        if (!isConfigured) {
          return;
        }

        editorContext?.setEditorStates((prev) => ({
          ...prev,
          isListening: true,
        }));
      }
    },
    onSpeechEnd: (audio) => {
      if (!isProcessingRef.current) {
        isProcessingRef.current = true;
        const wavBuffer = utils.encodeWAV(audio);
        const blob = new Blob([wavBuffer], { type: "audio/wav" });
        console.log("Speech end\n", blob);

        const sttModel = editorContext?.aiModelConfig.getSTTModel() as BaseSTT;
        const llmModel = editorContext?.aiModelConfig.getLLMModel() as BaseLLM;
        const ttsModel = editorContext?.aiModelConfig.getTTSModel() as BaseTTS;

        const agent = new CodeEditorAgent(sttModel, llmModel, ttsModel);
        const activeView = editorContext?.viewManager?.getActiveView();
        const viewDocument = activeView?.viewDocument;
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
            const codeEditor = activeView?.viewRef as CodeEditorViewRef;
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
                isProcessingRef.current = false;
              };
              editorContext?.setEditorStates((prev) => ({
                ...prev,
                isSpeaking: true,
              }));
              audio.play();
              return;
            }
            isProcessingRef.current = false;
          });
      }
    },
  });

  // Toggle recording
  useEffect(() => {
    if (editorContext?.editorStates?.isRecording) {
      vad.start();
    } else {
      vad.stop();
    }
  }, [editorContext?.editorStates, vad]);

  return (
    <div className="flex h-full w-full flex-col">
      <EditorToolbar />
      <ViewDisplayArea />
    </div>
  );
}
