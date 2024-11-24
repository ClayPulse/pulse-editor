"use client";

import Menu from "@/components/menu";
import CodeEditorView, {
  CodeEditorViewRef,
} from "@/components/views/code-editor-view";
import useMenuStatesContext from "@/lib/hooks/use-menu-states-context";
import { useMicVAD, utils } from "@/lib/hooks/use-mic-vad";
import { BaseLLM, getModelLLM } from "@/lib/llm/llm";
import { BaseSTT, getModelSTT } from "@/lib/stt/stt";
import {
  MutableRefObject,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import PasswordScreen from "@/components/password-screen";
import { ViewDocument } from "@/lib/interface";
import { CodeAgent } from "@/lib/agent/code-copilot";
import { BaseTTS, getModelTTS } from "@/lib/tts/tts";

export default function Home() {
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  const viewMap = useRef<Map<string, CodeEditorViewRef>>(new Map());

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
      const agent = new CodeAgent(
        sttModelRef.current,
        llmModelRef.current,
        ttsModelRef.current,
      );
      const viewDocument = viewMap.current.get("1")?.getViewDocument();
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

          // Apply changes
          viewMap.current.get("1")?.applyChanges(changes);

          // Play the audio in the blob
          if (result.audio) {
            const audio = new Audio(URL.createObjectURL(result.audio));
            audio.play();
          }
        });
    },
  });

  const { menuStates } = useMenuStatesContext();

  const [isOpen, setIsOpen] = useState(false);

  // Load models
  useEffect(() => {
    if (menuStates?.settings) {
      // Load STT
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

      // Load LLM
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

      // Load TTS
      if (
        menuStates.settings.ttsAPIKey &&
        menuStates.settings.ttsProvider &&
        menuStates.settings.ttsModel &&
        menuStates.settings.ttsVoice
      ) {
        const model = getModelTTS(
          menuStates.settings.ttsAPIKey,
          menuStates.settings.ttsProvider,
          menuStates.settings.ttsModel,
          menuStates.settings.ttsVoice,
        );
        ttsModelRef.current = model;
      } else {
        toast.error("Please set TTS Provider, Model and API key in settings");
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
            ref={(ref: CodeEditorViewRef) => {
              viewMap.current.set("1", ref);
            }}
            viewId="1"
            width="600px"
            height="100%"
            url="/test.tsx"
            isDrawingMode={menuStates?.isDrawingMode}
            isDownloadClip={menuStates?.isDownloadClip}
            isDrawHulls={menuStates?.isDrawHulls}
            setIsCanvasReady={setIsCanvasReady}
          />
        </div>
      </div>
    </div>
  );
}
