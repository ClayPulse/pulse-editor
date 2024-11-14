"use client";

import { DrawnLine } from "@/lib/interface";
import dynamic from "next/dynamic";
import { useMemo } from "react";

export default function CanvasEditor({
  onLineFinished,
  isDownloadClip,
  isDrawHulls,
}: {
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
    />
  );
}
