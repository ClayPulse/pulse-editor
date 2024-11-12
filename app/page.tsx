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
    <div className="h-full overflow-x-hidden">
      <div className="flex min-h-fit w-full flex-col">
        <div className="fixed z-10 h-fit w-full">
          <Menu onMenuStateChange={onMenuStateChange} />
        </div>
        <div className="relative mt-14 flex w-full flex-grow ">
          <div className="flex w-full flex-col items-center p-2">
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
              <CanvasEditor onLineFinished={addLine} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
