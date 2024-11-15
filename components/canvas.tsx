"use client";

import { convexHull } from "@/lib/convex-hull";
import { DrawnLine } from "@/lib/interface";
import html2canvas from "html2canvas";
import Konva from "konva";
import { Stage as StageType } from "konva/lib/Stage";
import { Layer as LayerType } from "konva/lib/Layer";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Line, Text } from "react-konva";
import { canvas } from "framer-motion/client";
import { recognizeText } from "@/lib/ocr";

export default function Canvas({
  editorCanvas,
  onLineFinished,
  isDrawHulls,
  isDownloadClip,
}: {
  editorCanvas: HTMLCanvasElement | null;
  onLineFinished: (lines: DrawnLine) => void;
  isDrawHulls: boolean;
  isDownloadClip: boolean;
}) {
  const [tool, setTool] = useState("pen");
  const [lines, setLines] = useState<DrawnLine[]>([]);
  const isDrawing = useRef(false);

  const stageRef = useRef<any>(null);
  const lastLineRef = useRef<DrawnLine | null>(null);

  const divRef = useRef<HTMLDivElement>(null);

  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);
  const { resolvedTheme } = useTheme();

  const editorCanvasRef = useRef<any>(null);

  useEffect(() => {
    /* Set dimension */
    function getDimension() {
      if (divRef.current) {
        setCanvasWidth(divRef.current.offsetWidth);
        setCanvasHeight(divRef.current.offsetHeight);
      }
    }
    getDimension();
    window.addEventListener("resize", getDimension);

    return () => {
      window.removeEventListener("resize", getDimension);
    };
  }, []);

  useEffect(() => {
    function renderEditorCanvas(canvas: HTMLCanvasElement) {
      /* Render the code editor content and add to layer*/
      const stage = stageRef.current;
      const layer = createCanvasLayer(canvas, stage);
      stage.add(layer);
      layer.moveToBottom();
      stage.draw();

      // Set the editor canvas
      editorCanvasRef.current = canvas;
    }

    if (editorCanvas) {
      renderEditorCanvas(editorCanvas)
    }
  }, [editorCanvas]);

  function createCanvasLayer(canvas: HTMLCanvasElement, stage: StageType) {
    const image = new window.Image();
    image.src = canvas.toDataURL();

    const konvaImage = new Konva.Image({
      image,
      x: 0,
      y: 0,
      width: stage.width(),
      height: stage.height(),
    });

    const layer = new Konva.Layer();
    layer.add(konvaImage);
    return layer;
  }

  function saveStage(stage: StageType) {
    // Save the screenshot
    const stageWidth = stage.width();
    const stageHeight = stage.height();
    const dataURL = stage.toDataURL({
      width: stageWidth,
      height: stageHeight,
    });
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "image.png";
    link.click();
    link.remove();
  }

  function clipConvexHull(
    stage: StageType,
    canvas: HTMLCanvasElement,
    line: DrawnLine,
    isDrawHulls: boolean,
  ): string {
    // Run convex hull algorithm to get the bounding box
    const points = line.points;
    const hulls = convexHull(
      points.map((point) => ({ x: point.x, y: point.y })),
    );

    /* Visualize a new Line object with the hull points */
    if (isDrawHulls) {
      const hullLine = new Konva.Line({
        points: hulls.flatMap((point) => [point.x, point.y]),
        stroke: "#00ff00",
        strokeWidth: 5,
        tension: 0.5,
        lineCap: "round",
        lineJoin: "round",
        closed: true,
      });
      // Add the hull line to the stage
      const layer = new Konva.Layer();
      layer.add(hullLine);
      stage.add(layer);
      stage.draw();
    }

    // Create a new canvas layer
    const canvasLayer = createCanvasLayer(canvas, stage);

    // Add the clip function to canvasLayer
    canvasLayer.clipFunc((ctx) => {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(hulls[0].x, hulls[0].y);
      for (let i = 1; i < hulls.length; i++) {
        ctx.lineTo(hulls[i].x, hulls[i].y);
      }
      ctx.closePath();
      ctx.clip();
    });

    // Calculate the bounding box height and width
    const validPoints = hulls.filter(
      (point) => typeof point.x === "number" && typeof point.y === "number",
    );
    const minX = Math.min(...validPoints.map((point) => point.x));
    const minY = Math.min(...validPoints.map((point) => point.y));
    const maxX = Math.max(...validPoints.map((point) => point.x));
    const maxY = Math.max(...validPoints.map((point) => point.y));

    // Get the clipped layer
    const dataURL = canvasLayer.toDataURL({
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    });
    return dataURL;
  }

  async function clipDrawnRegion(
    stage: StageType,
    canvas: HTMLCanvasElement,
    line: DrawnLine,
    isDrawHulls: boolean,
    isDownloadClip: boolean,
  ): Promise<string> {
    const imageData = clipConvexHull(stage, canvas, line, isDrawHulls);

    if (isDownloadClip) {
      // Download the cropped image
      const link = document.createElement("a");
      link.href = imageData;
      link.download = "image.png";
      link.click();
      link.remove();
    }

    return imageData;
  }

  async function clipAndExtract(line: DrawnLine) {
    const helper = () => {
      // Save the cropped image
      clipDrawnRegion(
        stageRef.current,
        editorCanvasRef.current,
        line,
        isDrawHulls,
        isDownloadClip,
      )
        // Recognize the text from the cropped image
        .then((imageData) => recognizeText(imageData))
        .then((text) => {
          console.log(text);
        });
    };

    helper();
  }

  const handleDrawStart = (e: any) => {
    isDrawing.current = true;
    const stage = stageRef.current;
    const pos = stage.getPointerPosition();
    const newLine = { tool, points: [pos.x, pos.y] };
    lastLineRef.current = newLine;
  };

  const handleDrawMove = (e: any) => {
    // no drawing - skipping
    if (!isDrawing.current) {
      return;
    }

    // Prevent scrolling on touch devices
    e.evt.preventDefault();

    const point = stageRef.current.getPointerPosition();
    // add point
    lastLineRef.current!.points = lastLineRef.current!.points.concat({
      x: point.x,
      y: point.y,
    });

    // replace last
    const newLines = lines
      .slice(0, lines.length - 1)
      .concat([lastLineRef.current!]);
    setLines(newLines);
  };

  const handleDrawEnd = (e: any) => {
    if (!lastLineRef.current) {
      return;
    }
    setLines([...lines, lastLineRef.current]);
    isDrawing.current = false;

    // Run this in background without blocking the UI
    clipAndExtract(lastLineRef.current);

    onLineFinished(lastLineRef.current);

    // Reset the stage and last line
    lastLineRef.current = null;
  };

  return (
    <div
      className="h-full w-full"
      ref={divRef}
      style={{
        // Get cursor based on theme
        cursor: resolvedTheme === "light"
            ? "url(/pencil-light.png) 0 24, auto"
            : "url(/pencil-dark.png) 0 24, auto",
      }}
    >
      <Stage
        ref={stageRef}
        width={canvasWidth}
        height={canvasHeight}
        onMouseDown={handleDrawStart}
        onMousemove={handleDrawMove}
        onMouseup={handleDrawEnd}
        onTouchStart={handleDrawStart}
        onTouchMove={handleDrawMove}
        onTouchEnd={handleDrawEnd}
      >
        <Layer>
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points.flatMap((point) => [point.x, point.y])}
              stroke="#df4b26"
              strokeWidth={5}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={
                line.tool === "eraser" ? "destination-out" : "source-over"
              }
            />
          ))}
        </Layer>
      </Stage>
      {/* <select
        className="absolute left-0 top-0"
        value={tool}
        onChange={(e) => {
          setTool(e.target.value);
        }}
      >
        <option value="pen">Pen</option>
        <option value="eraser">Eraser</option>
      </select> */}
    </div>
  );
}
