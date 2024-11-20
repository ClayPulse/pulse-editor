"use client";

import ReactCodeMirror, { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { useEffect, useRef, useState } from "react";
import { javascript } from "@codemirror/lang-javascript";
import ViewLayout from "./layout";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import { useTheme } from "next-themes";
import { Progress } from "@nextui-org/react";
import { DrawnLine, DrawingInformation } from "@/lib/interface";
import CanvasEditor from "../canvas/canvas-editor";
import html2canvas from "html2canvas";
import {
  isLineInRect,
  normalizeBoundingRect,
} from "@/lib/canvas/bounding-box-helper";

import React from "react";
import { createRoot } from "react-dom/client";
import useRecorder from "@/lib/hooks/use-recorder";

export default function CodeEditorView({
  width,
  height,
  content,
  isDrawingMode = false,
  isDownloadClip = false,
  isDrawHulls = false,
  setIsCanvasReady,
}: {
  width?: string;
  height?: string;
  content?: string;
  isDrawingMode?: boolean;
  isDownloadClip?: boolean;
  isDrawHulls?: boolean;
  setIsCanvasReady: (isReady: boolean) => void;
}) {
  /* Set editor content */
  const [value, setValue] = useState<string | undefined>(undefined);

  /* Set up theme */
  const [theme, setTheme] = useState(vscodeDark);
  const { resolvedTheme } = useTheme();
  const cmRef = useRef<ReactCodeMirrorRef>(null);

  const [lines, setLines] = useState<DrawnLine[]>([]);

  const drawingInformationMap = new Map<DrawnLine, DrawingInformation>();

  const { startRecording, stopRecording, audioData } = useRecorder();

  useEffect(() => {
    if (content) {
      setValue(content);
    }
  }, [content]);

  useEffect(() => {
    if (resolvedTheme === "dark") {
      setTheme(vscodeDark);
    } else {
      setTheme(vscodeLight);
    }
  }, [resolvedTheme]);

  useEffect(() => {
    // reset lines when drawing mode is off
    if (!isDrawingMode) {
      setLines([]);
      setIsCanvasReady(false);
      const canvasWidget = document.getElementById("canvas-widget");
      if (canvasWidget) {
        canvasWidget.remove();
      }

      return;
    }
    // Get editor canvas
    const scroller = cmRef.current?.view?.scrollDOM;
    if (!scroller) {
      throw new Error("Scroller not found");
    }
    const editorContent = cmRef.current?.view?.contentDOM;
    if (!editorContent) {
      throw new Error("Editor content not found");
    }

    const editor = document.getElementsByClassName("cm-editor")[0];
    if (!editor) {
      throw new Error("Editor not found");
    }

    // Get the background color of the editor
    const background = window.getComputedStyle(editor).backgroundColor;

    // Convert the editor content to a canvas using html2canvas
    html2canvas(editorContent, {
      windowWidth: editorContent.offsetWidth,
      windowHeight: editorContent.offsetHeight,
      backgroundColor: background,
    }).then((canvas) => {
      // Set the canvas to the state
      setIsCanvasReady(true);

      /* This finds cm-scroller and injects the canvas.
         This is doable because cm-scroller does not keep 
         track of its content (?). 
         
         It is known that injecting into cm-content will cause 
         CodeMirror to lose its internal states as the content
         is directly managed by CodeMirror internals.
         
         A better way to do this is to make a CodeMirror decoration
         instead of injecting into its DOM. */
      // Add the canvas to the editor content

      scroller.appendChild(
        getCanvasDOM(
          editorContent.getBoundingClientRect().left -
            scroller.getBoundingClientRect().left,
          canvas,
          resolvedTheme ?? "light",
        ),
      );
    });
  }, [isDrawingMode, resolvedTheme]);

  // When the cmRef component is mounted, get the bounding box of the editor
  // and set it to the state

  function getDrawingLocation(line: DrawnLine): {
    lineStart: number;
    lineEnd: number;
  } {
    const points = line.points;
    const pointsY = points
      .map((point) => point.y)
      .filter((point) => typeof point === "number");

    const minY = Math.min(...pointsY);
    const maxY = Math.max(...pointsY);

    const editorContent = cmRef.current?.view?.contentDOM;
    if (!editorContent) {
      throw new Error("Editor content not found");
    }

    // Go through each line and column to find the start and end
    console.log("minY", minY);
    console.log("maxY", maxY);
    const cmView = cmRef.current?.view;
    const cmState = cmRef.current?.state;

    const lineStartBlock = cmView?.lineBlockAtHeight(minY);
    const lineStart = lineStartBlock
      ? (cmState?.doc.lineAt(lineStartBlock.from).number ?? -1)
      : -1;

    const lineEndBlock = cmView?.lineBlockAtHeight(maxY);
    const lineEnd = lineEndBlock
      ? (cmState?.doc.lineAt(lineEndBlock.from).number ?? -1)
      : -1;

    return {
      lineStart: lineStart,
      lineEnd: lineEnd,
    };
  }

  function onChange(value: string) {
    setValue(value);
  }

  function onTextExtracted(line: DrawnLine, text: string) {
    setLines([...lines, line]);

    // Get location information
    const editorContent = cmRef.current?.view?.contentDOM;
    if (!editorContent) {
      throw new Error("Editor content not found");
    }
    const location = getDrawingLocation(line);

    const newInfo: DrawingInformation = {
      lineStart: location.lineStart,
      lineEnd: location.lineEnd,
      text,
    };

    drawingInformationMap.set(line, newInfo);
    console.log(newInfo);

    // Start code completion
    startRecording();
  }

  function getCanvasDOM(
    offsetX: number,
    editorCanvas: HTMLCanvasElement,
    theme: string,
  ) {
    function getCanvas(editorCanvas: HTMLCanvasElement, theme: string) {
      return (
        <div
          className="absolute left-0 top-0"
          style={{
            height: cmRef.current?.view?.contentDOM.offsetHeight,
            width: cmRef.current?.view?.contentDOM.offsetWidth,
          }}
        >
          <CanvasEditor
            onTextExtracted={onTextExtracted}
            isDownloadClip={isDownloadClip ?? false}
            isDrawHulls={isDrawHulls ?? false}
            editorCanvas={editorCanvas}
            theme={theme}
          />
        </div>
      );
    }

    const container = document.createElement("div");
    container.id = "canvas-widget";
    container.style.position = "absolute";
    container.style.left = offsetX + "px";

    const root = createRoot(container);
    const canvas = getCanvas(editorCanvas, theme);
    root.render(canvas);

    return container;
  }

  return (
    <ViewLayout width={width} height={height}>
      <div className="relative h-full w-full overflow-hidden rounded-lg bg-content2">
        {value ? (
          <ReactCodeMirror
            ref={cmRef}
            value={value}
            onChange={onChange}
            extensions={[javascript({ jsx: true })]}
            theme={theme}
            height="100%"
            style={{
              height: "100%",
            }}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center">
            <Progress
              isIndeterminate={true}
              className="w-1/2"
              color="default"
              size="md"
              label="Loading..."
              classNames={{
                label: "w-full text-center",
              }}
            />
          </div>
        )}
      </div>
    </ViewLayout>
  );
}
