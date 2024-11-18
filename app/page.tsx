"use client";

import Menu from "@/components/menu";
import CodeEditorView from "@/components/views/code-editor-view";
import { useMicVAD, utils } from "@/lib/hooks/use-mic-vad";
import { MenuStates } from "@/lib/interface";
import { getModelLLM } from "@/lib/llm/llm";
import { getModelSTT } from "@/lib/stt/stt";
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

  const sttModel = getModelSTT(
    process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
    "openai",
    "whisper-1",
  );

  const llmModel = getModelLLM(
    process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
    "openai",
    "gpt-4o-mini",
    0.7,
  );

  const vad = useMicVAD({
    startOnLoad: false,
    ortConfig(ort) {
      ort.env.wasm.wasmPaths = "/";
    },
    workletURL: "/vad/vad.worklet.bundle.min.js",
    modelURL: "/vad/silero_vad.onnx",
    onSpeechEnd: (audio) => {
      const wavBuffer = utils.encodeWAV(audio);
      const blob = new Blob([wavBuffer], { type: "audio/wav" });
      console.log("Speech end\n", blob);
      sttModel.generate(blob).then((sttResult) => {
        console.log("STT result:\n", sttResult);
        llmModel.generate(sttResult).then((llmResult) => {
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

  return (
    <div className="flex h-screen w-full flex-col overflow-x-hidden">
      <div className={`fixed z-10 h-14 w-full`}>
        <Menu menuStates={menuStates} setMenuStates={setMenuStates} />
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
