"use client";

import CanvasEditor from "@/components/canvas-editor";
import Menu from "@/components/menu";
import MenuToolbar from "@/components/toolbars/menu-toolbar";
import CodeEditorView, {
  CodeEditorViewRef,
} from "@/components/views/code-editor-view";
import { DrawnLine, MenuStates } from "@/lib/interface";
import { Button, Divider } from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const codeEditorRef = useRef<CodeEditorViewRef>(null);

  // get file from /test.tsx
  const [content, setContent] = useState<string | undefined>(undefined);

  const [lines, setLines] = useState<DrawnLine[]>([]);

  const [menuStates, setMenuStates] = useState({
    isDrawingMode: false,
  });

  function onMenuStateChange(menuStates: MenuStates) {
    setMenuStates(menuStates);
  }

  function addLine(line: DrawnLine) {
    setLines([...lines, line]);
  }

  useEffect(() => {
    fetch("/test.tsx")
      .then((res) => res.text())
      .then((text) => {
        setContent(text);
      });
  }, []);

  return (
    <div className="flex h-full w-full flex-col">
      <Menu onMenuStateChange={onMenuStateChange} />
      <div className="relative flex w-full flex-grow">
        <div className="flex h-full w-full flex-col items-center p-2">
          <CodeEditorView
            width="600px"
            height="400px"
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
        <div className="absolute left-0 top-0 h-full w-full">
          <CanvasEditor onLineFinished={addLine} />
        </div>
      </div>
    </div>
  );
}
