"use client";

import Menu from "@/components/menu";
import CodeEditorView from "@/components/views/code-editor-view";
import { DrawnLine, MenuStates } from "@/lib/interface";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  // get file from /test.tsx
  const [content, setContent] = useState<string | undefined>(undefined);

  const [menuStates, setMenuStates] = useState<MenuStates>({
    isDrawingMode: false,
    isDrawHulls: true,
    isDownloadClip: false,
  });
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  useEffect(() => {
    fetch("/test.tsx")
      .then((res) => res.text())
      .then((text) => {
        setContent(text);
      });
  }, []);

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
