"use client";

import Menu from "@/components/menu";
import CodeEditorView from "@/components/editor-views/code-editor-view";
import useMenuStatesContext from "@/lib/hooks/use-menu-states-context";
import { useMicVAD, utils } from "@/lib/hooks/use-mic-vad";
import { BaseLLM, getModelLLM } from "@/lib/llm/llm";
import { BaseSTT, getModelSTT } from "@/lib/stt/stt";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PasswordScreen from "@/components/password-screen";

export default function Home() {
  // get file from /test.tsx
  const [content, setContent] = useState<string | undefined>(undefined);

  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [sttModel, setSttModel] = useState<BaseSTT | undefined>(undefined);
  const [llmModel, setLlmModel] = useState<BaseLLM | undefined>(undefined);

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
      console.log(sttModel, llmModel);
      sttModel?.generate(blob).then((sttResult) => {
        console.log("STT result:\n", sttResult);
        llmModel?.generate(sttResult).then((llmResult) => {
          console.log("LLM result:\n", llmResult);
          toast("Agent:\n" + llmResult);
        });
      });
    },
  });

  const { menuStates } = useMenuStatesContext();

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetch("/test.tsx")
      .then((res) => res.text())
      .then((text) => {
        setContent(text);
      });
  }, []);

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
        setSttModel(model);
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
        setLlmModel(model);
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
            width="600px"
            height="100%"
            content={content}
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
