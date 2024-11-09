import CanvasEditor from "@/components/canvas-editor";
import CodeEditorView from "@/components/views/code-editor-view";

export default function Home() {
  return (
    <div className="flex h-screen w-screen flex-col items-center">
      <CodeEditorView width="600px" height="400px" />
      <CanvasEditor />
    </div>
  );
}
