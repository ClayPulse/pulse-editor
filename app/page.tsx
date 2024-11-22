"use client";

import Menu from "@/components/menu";
import CodeEditorView from "@/components/views/code-editor-view";
import useMenuStatesContext from "@/lib/hooks/use-menu-states-context";
import { useMicVAD, utils } from "@/lib/hooks/use-mic-vad";
import { BaseLLM, getModelLLM } from "@/lib/llm/llm";
import { BaseSTT, getModelSTT } from "@/lib/stt/stt";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import PasswordScreen from "@/components/password-screen";
import { SelectionInformation, ViewDocument } from "@/lib/interface";
import { predictCodeCompletion } from "@/lib/agent/code-copilot";
import { BaseTTS } from "@/lib/tts/tts";

export default function Home() {
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  const viewDocumentMap = useRef<Map<string, ViewDocument>>(new Map());

  const sttModelRef = useRef<BaseSTT | undefined>(undefined);
  const llmModelRef = useRef<BaseLLM | undefined>(undefined);
  const ttsModelRef = useRef<BaseTTS | undefined>(undefined);
  const vad = useMicVAD({
    startOnLoad: false,
    ortConfig(ort) {
      ort.env.wasm.wasmPaths = "/vad/";
    },
    workletURL: "/vad/vad.worklet.bundle.min.js",
    modelURL: "/vad/silero_vad.onnx",
    onSpeechEnd: (audio) => {
      const wavBuffer = utils.encodeWAV(audio);
      const blob = new Blob([wavBuffer], { type: "audio/wav" });
      console.log("Speech end\n", blob);

      if (!llmModelRef.current) {
        toast.error("LLM model not loaded");
        return;
      }
      predictCodeCompletion(
        sttModelRef.current,
        llmModelRef.current,
        ttsModelRef.current,
        viewDocumentMap.current.get("1")?.fileContent || "",
        viewDocumentMap.current.get("1")?.selections || [],
        {
          audio: blob,
        },
      ).then((result) => {
        toast("Agent:\n" + result.text);
      });
    },
  });

  const { menuStates } = useMenuStatesContext();

  const [isOpen, setIsOpen] = useState(false);

  // Load models
  useEffect(() => {
    if (menuStates?.settings) {
      if (
        menuStates.settings.sttAPIKey &&
        menuStates.settings.sttProvider &&
        menuStates.settings.sttModel
      ) {
        const model = getModelSTT(
          menuStates.settings.sttAPIKey,
          menuStates.settings.sttProvider,
          menuStates.settings.sttModel,
        );
        sttModelRef.current = model;
      } else {
        toast.error("Please set STT Provider, Model and API key in settings");
      }
      if (
        menuStates.settings.llmAPIKey &&
        menuStates.settings.llmProvider &&
        menuStates.settings.llmModel
      ) {
        const model = getModelLLM(
          menuStates.settings.llmAPIKey,
          menuStates.settings.llmProvider,
          menuStates.settings.llmModel,
          0.85,
        );
        llmModelRef.current = model;
      } else {
        toast.error("Please set LLM Provider, Model and API key in settings");
      }
    }
  }, [menuStates]);

  // Toggle recording
  useEffect(() => {
    if (menuStates?.isRecording) {
      vad.start();
    } else {
      vad.stop();
    }
  }, [menuStates, vad]);

  // Open PasswordScreen if password is set
  useEffect(() => {
    if (
      menuStates?.settings?.isUsePassword &&
      !menuStates?.settings?.password
    ) {
      setIsOpen(true);
    }
  }, [menuStates]);

  const onViewDocumentChange = useCallback(
    (viewId: string, viewDocument: ViewDocument | undefined) => {
      if (!viewDocument) {
        return viewDocumentMap.current.delete(viewId);
      }

      viewDocumentMap.current.set(viewId, viewDocument);
      console.log("Selection information processed", viewDocumentMap.current);
    },
    [],
  );

  return (
    <div className="flex h-screen w-full flex-col overflow-x-hidden">
      <PasswordScreen isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`fixed z-10 h-14 w-full`}>
        <Menu />
      </div>
      <div
        className={`mt-14 flex min-h-0 w-full flex-grow`}
        style={{
          cursor: menuStates?.isDrawingMode && !isCanvasReady ? "wait" : "auto",
        }}
      >
        <div className="flex w-full flex-col items-center bg-background p-2">
          <CodeEditorView
            viewId="1"
            width="600px"
            height="100%"
            url="/test.tsx"
            isDrawingMode={menuStates?.isDrawingMode}
            isDownloadClip={menuStates?.isDownloadClip}
            isDrawHulls={menuStates?.isDrawHulls}
            setIsCanvasReady={setIsCanvasReady}
            onViewDocumentChange={onViewDocumentChange}
          />
        </div>
      </div>
    </div>
  );
}
