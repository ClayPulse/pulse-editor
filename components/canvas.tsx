"use client";

import { useRef, useState } from "react";
import { Stage, Layer, Line, Text } from "react-konva";

export default function Canvas() {
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
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleDrawEnd = () => {
    isDrawing.current = false;
  };
  return (
    <div className="absolute h-screen w-screen">
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleDrawStart}
        onMousemove={handleDrawMove}
        onMouseup={handleDrawEnd}
        onTouchStart={handleDrawStart}
        onTouchMove={handleDrawMove}
        onTouchEnd={handleDrawEnd}
      >
        <Layer>
          <Text text="Just start drawing" x={5} y={30} />
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
