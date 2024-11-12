"use client";

import { DrawnLine } from "@/lib/interface";
import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Line, Text } from "react-konva";

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
    lastLineRef.current!.points = lastLineRef.current!.points.concat([
      point.x,
      point.y,
    ]);

    // replace last
    const newLines = lines
      .slice(0, lines.length - 1)
      .concat([lastLineRef.current!]);
    setLines(newLines);
  };

  // function cropStage(stage: StageType) {
  //   const stageWidth = stage.width();
  //   const stageHeight = stage.height();
  //   const buffer = 100;
  //   const dataURL = stage.toDataURL({
  //     x: buffer,
  //     y: buffer,
  //     width: stageWidth - buffer * 2,
  //     height: stageHeight - buffer * 2,
  //   });
  //   const link = document.createElement("a");
  //   link.href = dataURL;
  //   link.download = "image.png";
  //   link.click();
  //   link.remove();
  // }

  const handleDrawEnd = (e: any) => {
    setLines([...lines, lastLineRef.current!]);
    isDrawing.current = false;
    // Save the cropped image
    // const stage = e.target.getStage();
    // cropStage(stage);
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
      console.log(divRef.current.scrollWidth, divRef.current.scrollHeight);
    }
  };

  useEffect(() => {
    getDimension();
    window.addEventListener("resize", getDimension);
    return () => {
      window.removeEventListener("resize", getDimension);
    };
  }, []);

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
      >
        <Layer>
          <Text text="Just start drawing" x={500} y={300} />
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
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
