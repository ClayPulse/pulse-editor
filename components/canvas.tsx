"use client";

import { Stage as StageType } from "konva/lib/Stage";
import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Line, Text } from "react-konva";

export default function Canvas({}: {}) {
  const [tool, setTool] = useState("pen");
  const [lines, setLines] = useState<{ tool: string; points: number[] }[]>([]);
  const isDrawing = useRef(false);

  const handleDrawStart = (e: any) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { tool, points: [pos.x, pos.y] }]);
  };

  const handleDrawMove = (e: any) => {
    // no drawing - skipping
    if (!isDrawing.current) {
      return;
    }

    // Prevent scrolling on touch devices
    e.evt.preventDefault();

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const lastLine = lines[lines.length - 1];
    // add point
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    // replace last
    const newLines = lines.slice(0, lines.length - 1).concat([lastLine]);
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
    isDrawing.current = false;
    // Save the cropped image
    const stage = e.target.getStage();
    // cropStage(stage);
  };

  const divRef = useRef<HTMLDivElement>(null);

  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);

  const getDimension = () => {
    if (divRef.current) {
      setCanvasWidth(divRef.current.offsetWidth);
      setCanvasHeight(divRef.current.offsetHeight);
      console.log(divRef.current.offsetWidth, divRef.current.offsetHeight);
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
    <div className="absolute h-full w-full" ref={divRef}>
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
      <select
        className="absolute left-0 top-0"
        value={tool}
        onChange={(e) => {
          setTool(e.target.value);
        }}
      >
        <option value="pen">Pen</option>
        <option value="eraser">Eraser</option>
      </select>
    </div>
  );
}
