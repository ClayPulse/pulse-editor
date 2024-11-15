"use client";

import CanvasEditor from "@/components/canvas-editor";
import Menu from "@/components/menu";
import CodeEditorView, {
  CodeEditorViewRef,
} from "@/components/views/code-editor-view";
import { DrawnLine, MenuStates } from "@/lib/interface";
import { Button, Divider } from "@nextui-org/react";
import html2canvas from "html2canvas";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const codeEditorRef = useRef<CodeEditorViewRef>(null);

  // get file from /test.tsx
  const [content, setContent] = useState<string | undefined>(undefined);

  const [lines, setLines] = useState<DrawnLine[]>([]);

  const [menuStates, setMenuStates] = useState<MenuStates>({
    isDrawingMode: false,
    isDrawHulls: true,
    isDownloadClip: false,
  });
  const [editorCanvas, setEditorCanvas] = useState<HTMLCanvasElement | null>(
    null,
  );

  useEffect(() => {
    fetch("/test.tsx")
      .then((res) => res.text())
      .then((text) => {
        setContent(text);
      });
  }, []);

  useEffect(() => {
    // reset lines when drawing mode is off
    if (!menuStates.isDrawingMode) {
      setLines([]);
    } else {
      // Get editor canvas
      const editorContent = document.getElementById("editor-content");
      if (!editorContent) {
        throw new Error("Editor content not found");
      }

      // Convert the editor content to a canvas using html2canvas
      html2canvas(editorContent).then((canvas) => {
        // Set the canvas to the state
        setEditorCanvas(canvas);
      });
    }
  }, [menuStates]);

  function addLine(line: DrawnLine) {
    setLines([...lines, line]);
  }

  return (
    <div className="h-full overflow-x-hidden">
      <div className="flex min-h-fit w-full flex-col">
        <div className="fixed z-10 h-fit w-full">
          <Menu menuStates={menuStates} setMenuStates={setMenuStates} />
        </div>
        <div className="relative mt-14 flex w-full flex-grow">
          <div
            className="flex w-full flex-col items-center bg-background p-2"
            id="editor-content"
          >
            <CodeEditorView
              width="600px"
              height="4000px"
              ref={codeEditorRef}
              content={content}
            />

            <Button
              onClick={() => {
                // codeEditorRef.current?.setValue(`console.log("Hello, World!")`);
              }}
            >
              Click
            </Button>
          </div>
          {menuStates.isDrawingMode && (
            <div className="absolute left-0 top-0 h-full w-full">
              <CanvasEditor
                onLineFinished={addLine}
                isDownloadClip={menuStates.isDownloadClip}
                isDrawHulls={menuStates.isDrawHulls}
                editorCanvas={editorCanvas}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
