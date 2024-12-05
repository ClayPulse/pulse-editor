"use client";

import { DrawnLine } from "@/lib/types";
import dynamic from "next/dynamic";
import { useMemo } from "react";

export default function CanvasEditor({
  editorCanvas,
  onTextExtracted,
  isDownloadClip,
  isDrawHulls,
  theme,
}: {
  editorCanvas: HTMLCanvasElement | null;
  onTextExtracted: (line:DrawnLine, text: string) => void;
  isDownloadClip: boolean;
  isDrawHulls: boolean;
  theme: string;
}) {
  const Canvas = useMemo(
    () => dynamic(() => import("@/components/canvas/canvas"), { ssr: false }),
    [],
  );
  return (
    <Canvas
      onTextExtracted={onTextExtracted}
      isDownloadClip={isDownloadClip}
      isDrawHulls={isDrawHulls}
      editorCanvas={editorCanvas}
      theme={theme}
    />
  );
}
