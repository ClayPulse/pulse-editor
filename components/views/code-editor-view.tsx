"use client";

import ReactCodeMirror, { EditorView } from "@uiw/react-codemirror";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
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
  getSelectionInformation: (line: DrawnLine) => SelectionInformation;
}

const CodeEditorView = forwardRef(
  (props: CodeEditorViewProps, ref: React.Ref<CodeEditorViewRef>) => {
    /* Set editor content */
    const [value, setValue] = useState<string | undefined>(undefined);
    const onChange = (value: string) => {
      setValue(value);
    };
    useEffect(() => {
      if (props.content) {
        setValue(props.content);
      }
    }, [props.content]);

    /* Set up theme */
    const [theme, setTheme] = useState(vscodeDark);
    const { resolvedTheme } = useTheme();
    useEffect(() => {
      if (resolvedTheme === "dark") {
        setTheme(vscodeDark);
      } else {
        setTheme(vscodeLight);
      }
    }, [resolvedTheme]);

    useImperativeHandle(ref, () => ({
      getSelectionInformation: (line: DrawnLine): SelectionInformation => {
        const points = line.points;
        const lineStart = points[0];
        const colStart = points[1];
        const lineEnd = points[points.length - 2];
        const colEnd = points[points.length - 1];
        return {
          lineStart,
          lineEnd,
          colStart,
          colEnd,
        };
      },
    }));

    return (
      <ViewLayout width={props.width} height={props.height}>
        <div className="h-full w-full overflow-hidden rounded-lg bg-content2">
          {value ? (
            <ReactCodeMirror
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

export default CodeEditorView;
