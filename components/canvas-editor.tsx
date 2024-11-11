"use client";

import { DrawnLine } from "@/lib/interface";
import dynamic from "next/dynamic";
import { useMemo } from "react";

export default function CanvasEditor({
  onLineFinished,
}: {
  onLineFinished: (lines: DrawnLine) => void;
}) {
  const Canvas = useMemo(
    () => dynamic(() => import("@/components/canvas"), { ssr: false }),
    [],
  );
  return <Canvas onLineFinished={onLineFinished} />;
}
