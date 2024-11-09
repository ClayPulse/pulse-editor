"use client";

import dynamic from "next/dynamic";

export default function CanvasEditor() {
  const Canvas = dynamic(() => import("@/components/canvas"), { ssr: false });
  return <Canvas />;
}
