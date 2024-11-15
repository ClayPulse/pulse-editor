"use client";

import { DrawnLine } from "@/lib/interface";
import dynamic from "next/dynamic";
import { useMemo } from "react";

export default function CanvasEditor({
  editorCanvas,
  onLineFinished,
  isDownloadClip,
  isDrawHulls,
}: {
  editorCanvas: HTMLCanvasElement | null;
  onLineFinished: (lines: DrawnLine) => void;
  isDownloadClip: boolean;
  isDrawHulls: boolean;
}) {
  const Canvas = useMemo(
    () => dynamic(() => import("@/components/canvas"), { ssr: false }),
    [],
  );
  return (
    <Canvas
      onLineFinished={onLineFinished}
      isDownloadClip={isDownloadClip}
      isDrawHulls={isDrawHulls}
      editorCanvas={editorCanvas}
    />
  );
}
