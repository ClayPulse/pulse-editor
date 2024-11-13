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

export default function Canvas({
  onLineFinished,
}: {
  onLineFinished: (lines: DrawnLine) => void;
}) {
  const [tool, setTool] = useState("pen");
  const [lines, setLines] = useState<DrawnLine[]>([]);
  const isDrawing = useRef(false);

  const stageRef = useRef<any>(null);
  const lastLineRef = useRef<DrawnLine | null>(null);

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

  function clipAndSaveConvexHull(
    stage: StageType,
    canvas: HTMLCanvasElement,
    line: DrawnLine,
  ) {
    // Run convex hull algorithm to get the bounding box
    const points = line.points;
    const hulls = convexHull(
      points.map((point) => ({ x: point.x, y: point.y })),
    );

    /* Visualize a new Line object with the hull points */
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

    // Save the clipped layer
    const dataURL = canvasLayer.toDataURL({
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    });
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "image.png";
    link.click();
    link.remove();
  }

  function cropStage(stage: StageType, line: DrawnLine) {
    const editorContent = document.getElementById("editor-content");
    if (!editorContent) {
      alert("No content to screenshot");
      return;
    }

    // Convert the editor content to a canvas using html2canvas
    html2canvas(editorContent)
      .then((canvas) => {
        // Add the rendered canvas to the stage
        const layer = createCanvasLayer(canvas, stage);
        stage.add(layer);
        layer.moveToBottom();
        stage.draw();

        return canvas;
      })
      .then((canvas) => {
        // Save the full editor stage
        // saveStage(stage);

        // Clip drawn line and save the convex hull
        clipAndSaveConvexHull(stage, canvas, line);
      });
  }

  const handleDrawStart = (e: any) => {
    isDrawing.current = true;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    const newLine = { tool, points: [pos.x, pos.y] };
    stageRef.current = stage;
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
    // Save the cropped image
    const stage = e.target.getStage();
    cropStage(stage, lastLineRef.current!);
    onLineFinished(lastLineRef.current!);

    // Reset the stage and last line
    stageRef.current = null;
    lastLineRef.current = null;
  };

  const divRef = useRef<HTMLDivElement>(null);

  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);

  const getDimension = () => {
    if (divRef.current) {
      setCanvasWidth(divRef.current.offsetWidth);
      setCanvasHeight(divRef.current.offsetHeight);
    }
  };

  useEffect(() => {
    getDimension();
    window.addEventListener("resize", getDimension);
    return () => {
      window.removeEventListener("resize", getDimension);
    };
  }, []);

  const { resolvedTheme } = useTheme();

  return (
    <div className="h-full w-full" ref={divRef}>
      <Stage
        width={canvasWidth}
        height={canvasHeight}
        onMouseDown={handleDrawStart}
        onMousemove={handleDrawMove}
        onMouseup={handleDrawEnd}
        onTouchStart={handleDrawStart}
        onTouchMove={handleDrawMove}
        onTouchEnd={handleDrawEnd}
        style={{
          // Get cursor based on theme
          cursor:
            resolvedTheme === "light"
              ? "url(/pencil-light.png) 0 24, auto"
              : "url(/pencil-dark.png) 0 24, auto",
        }}
      >
        <Layer>
          <Text text="Just start drawing" x={500} y={300} />
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
