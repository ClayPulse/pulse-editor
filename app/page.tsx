"use client";

import Menu from "@/components/menu";
import CodeEditorView from "@/components/views/code-editor-view";
import { useMicVAD, utils } from "@/lib/hooks/use-mic-vad";
import { MenuStates } from "@/lib/interface";
import { BaseLLM, getModelLLM } from "@/lib/llm/llm";
import { BaseSTT, getModelSTT } from "@/lib/stt/stt";
import { Input } from "@nextui-org/react";
import { useEffect, useState } from "react";

export default function Home() {
  // get file from /test.tsx
  const [content, setContent] = useState<string | undefined>(undefined);

  const [menuStates, setMenuStates] = useState<MenuStates>({
    isDrawingMode: false,
    isDrawHulls: true,
    isDownloadClip: false,
    isRecording: false,
  });
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [apiKey, setApiKey] = useState<string | undefined>(undefined);
  const [sttModel, setSttModel] = useState<BaseSTT | undefined>(undefined);
  const [llmModel, setLlmModel] = useState<BaseLLM | undefined>(undefined);

  // const sttModel = getModelSTT(apiKey!, "openai", "whisper-1");

  // const llmModel = getModelLLM(apiKey!, "openai", "gpt-4o-mini", 0.7);

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
      sttModel?.generate(blob).then((sttResult) => {
        console.log("STT result:\n", sttResult);
        llmModel?.generate(sttResult).then((llmResult) => {
          console.log("LLM result:\n", llmResult);
        });
      });
    },
  });

  useEffect(() => {
    fetch("/test.tsx")
      .then((res) => res.text())
      .then((text) => {
        setContent(text);
      });
  }, []);

  useEffect(() => {
    if (menuStates.isRecording) {
      vad.start();
    } else {
      vad.stop();
    }
  }, [menuStates, vad]);

  useEffect(() => {
    if (apiKey) {
      setSttModel(getModelSTT(apiKey, "openai", "whisper-1"));
      setLlmModel(getModelLLM(apiKey, "openai", "gpt-4o-mini", 0.7));
    }
  }, [apiKey]);

  return (
    <div className="flex h-screen w-full flex-col overflow-x-hidden">
      <div className={`fixed z-10 h-14 w-full`}>
        <Menu menuStates={menuStates} setMenuStates={setMenuStates} />
      </div>
      <div className="mt-14 h-4 w-80 px-2">
        <Input
          placeholder="OpenAI API key"
          value={apiKey}
          onValueChange={(value) => setApiKey(value)}
        />
      </div>
      <div
        className={`mt-14 flex min-h-0 w-full flex-grow`}
        style={{
          cursor: menuStates.isDrawingMode && !isCanvasReady ? "wait" : "auto",
        }}
      >
        <div className="flex w-full flex-col items-center bg-background p-2">
          <CodeEditorView
            width="600px"
            height="100%"
            content={content}
            isDrawingMode={menuStates.isDrawingMode}
            isDownloadClip={menuStates.isDownloadClip}
            isDrawHulls={menuStates.isDrawHulls}
            setIsCanvasReady={setIsCanvasReady}
          />
        </div>
      </div>
    </div>
  );
}
