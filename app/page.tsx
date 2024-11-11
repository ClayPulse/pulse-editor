"use client";

import CanvasEditor from "@/components/canvas-editor";
import CodeEditorView, {
  CodeEditorViewRef,
} from "@/components/views/code-editor-view";
import { Button } from "@nextui-org/react";
import { useRef } from "react";

export default function Home() {
  const codeEditorRef = useRef<CodeEditorViewRef>(null);

  return (
    <div className="flex h-full w-full flex-col items-center">
      <CodeEditorView width="600px" height="400px" ref={codeEditorRef} />
      <Button
        onClick={() => {
          codeEditorRef.current?.setValue(`console.log("Hello, World!")`);
        }}
      >
        Click
      </Button>
      {/* <CanvasEditor /> */}
    </div>
  );
}
