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

export interface CodeEditorViewProps {
  width?: string;
  height?: string;
  content?: string;
}

export interface CodeEditorViewRef {
  getSelectionInformation: (
    line: DrawnLine,
    parentBoundingRect: DOMRect,
  ) => SelectionInformation;
}

const CodeEditorView = forwardRef(
  (props: CodeEditorViewProps, ref: React.Ref<CodeEditorViewRef>) => {
    /* Set editor content */
    const [value, setValue] = useState<string | undefined>(undefined);

    /* Set up theme */
    const [theme, setTheme] = useState(vscodeDark);
    const { resolvedTheme } = useTheme();
    const cmRef = useRef<ReactCodeMirrorRef>(null);

    useEffect(() => {
      if (props.content) {
        setValue(props.content);
      }
    }, [props.content]);

    useEffect(() => {
      if (resolvedTheme === "dark") {
        setTheme(vscodeDark);
      } else {
        setTheme(vscodeLight);
      }
    }, [resolvedTheme]);

    // When the cmRef component is mounted, get the bounding box of the editor
    // and set it to the state

    useImperativeHandle(ref, () => ({
      getSelectionInformation: (
        line: DrawnLine,
        parentBoundingRect: DOMRect,
      ): SelectionInformation => {
        const boundingRect =
          cmRef.current?.editor?.getBoundingClientRect() as DOMRect;

        const normalizedBoundingRect = normalizeBoundingRect(
          boundingRect,
          parentBoundingRect,
        );
        console.log(normalizedBoundingRect, line);

        const isInRect = isLineInRect(line, normalizedBoundingRect);
        console.log("isInRect", isInRect);

        return {
          lineStart: 0,
          lineEnd: 0,
          colStart: 0,
          colEnd: 0,
        };
      },
    }));

    function onChange(value: string) {
      setValue(value);
    }

    function normalizeBoundingRect(
      rect: DOMRect,
      parentRect: DOMRect,
    ): DOMRect {
      // Get the relative position of the child element
      const x = rect.x - parentRect.x;
      const y = rect.y - parentRect.y;

      const normalized: DOMRect = {
        x,
        y,
        width: rect.width,
        height: rect.height,
        top: y,
        right: x + rect.width,
        bottom: y + rect.height,
        left: x,
        toJSON: function () {
          return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            top: this.top,
            right: this.right,
            bottom: this.bottom,
            left: this.left,
          };
        },
      };

      return normalized;
    }

    function isLineInRect(line: DrawnLine, boundingRect: DOMRect) {
      // Check if the line is within the bounding box
      let isInRect = false;
      line.points.forEach((point) => {
        if (
          point.x >= boundingRect.x &&
          point.x <= boundingRect.x + boundingRect.width &&
          point.y >= boundingRect.y &&
          point.y <= boundingRect.y + boundingRect.height
        ) {
          isInRect = true;
        }
      });

      return isInRect;
    }

    return (
      <ViewLayout width={props.width} height={props.height}>
        <div className="h-full w-full overflow-hidden rounded-lg bg-content2">
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
  },
);

CodeEditorView.displayName = "CodeEditorView";

export default CodeEditorView;
