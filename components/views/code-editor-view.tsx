"use client";

import ReactCodeMirror, {
  EditorView,
  ReactCodeMirrorRef,
} from "@uiw/react-codemirror";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { javascript } from "@codemirror/lang-javascript";
import ViewLayout from "./layout";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import { useTheme } from "next-themes";
import { Progress } from "@nextui-org/react";
import { DrawnLine, SelectionInformation } from "@/lib/interface";
import CanvasEditor from "../canvas-editor";
import html2canvas from "html2canvas";
import { isLineInRect, normalizeBoundingRect } from "@/lib/bounding-box-helper";

import React from "react";
import { Decoration, keymap, WidgetType } from "@codemirror/view";
import { StateField, StateEffect } from "@codemirror/state";
import { createRoot } from "react-dom/client";

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

  class CanvasWidget extends WidgetType {
    editorCanvas: HTMLCanvasElement;
    offsetX: number;
    theme: string;

    constructor(
      editorCanvas: HTMLCanvasElement,
      offsetX: number,
      theme: string,
    ) {
      super();
      this.editorCanvas = editorCanvas;
      this.offsetX = offsetX;
      this.theme = theme;
    }

    getCanvas(editorCanvas: HTMLCanvasElement, theme: string) {
      return (
        <div
          className="absolute left-0 top-0"
          style={{
            height: cmRef.current?.view?.contentDOM.offsetHeight,
            width: cmRef.current?.view?.contentDOM.offsetWidth,
          }}
        >
          <CanvasEditor
            onLineFinished={onLineFinished}
            isDownloadClip={isDownloadClip ?? false}
            isDrawHulls={isDrawHulls ?? false}
            editorCanvas={editorCanvas}
            theme={theme}
          />
        </div>
      );
    }

    toDOM() {
      const container = document.createElement("div");
      container.id = "canvas-widget";
      container.style.position = "absolute";
      container.style.left = this.offsetX + "px";

      const root = createRoot(container);
      const canvas = this.getCanvas(this.editorCanvas, this.theme);
      root.render(canvas);

      return container;
    }
  }

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
    const editorContent = cmRef.current?.view?.contentDOM;
    if (!editorContent) {
      throw new Error("Editor content not found");
    }

    // Convert the editor content to a canvas using html2canvas
    html2canvas(editorContent, {
      windowWidth: editorContent.offsetWidth,
      windowHeight: editorContent.offsetHeight,
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
      const scroller = document.getElementsByClassName("cm-scroller")[0];
      const content = document.getElementsByClassName("cm-content")[0];
      const widget = new CanvasWidget(
        canvas,
        content.getBoundingClientRect().left -
          scroller.getBoundingClientRect().left,
        resolvedTheme ?? "light",
      );
      console.log(canvas)
      scroller.appendChild(widget.toDOM());
    });

    console.log(editorContent.offsetHeight, editorContent.offsetWidth);
  }, [isDrawingMode, setIsCanvasReady]);

  // When the cmRef component is mounted, get the bounding box of the editor
  // and set it to the state

  function getSelectionInformation(
    line: DrawnLine,
    parentBoundingRect: DOMRect,
  ): SelectionInformation | null {
    const boundingRect =
      cmRef.current?.editor?.getBoundingClientRect() as DOMRect;

    const normalizedBoundingRect = normalizeBoundingRect(
      boundingRect,
      parentBoundingRect,
    );


    return {
      lineStart: 0,
      lineEnd: 0,
      colStart: 0,
      colEnd: 0,
    };
  }

  function onChange(value: string) {
    setValue(value);
  }

  function onLineFinished(line: DrawnLine) {
    setLines([...lines, line]);
    // Get editor canvas
    const editorContent = cmRef.current?.view?.contentDOM;
    if (!editorContent) {
      throw new Error("Editor content not found");
    }
    const parentBoundingRect = editorContent.getBoundingClientRect();
    const selection = getSelectionInformation(line, parentBoundingRect);

    if (selection) {
      console.log(selection);
    }
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
