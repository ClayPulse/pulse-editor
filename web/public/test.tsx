"use client";

import ReactCodeMirror, { EditorView } from "@uiw/react-codemirror";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { javascript } from "@codemirror/lang-javascript";
import ViewLayout from "./layout";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import { useTheme } from "next-themes";

export interface CodeEditorViewProps {
  width?: string;
  height?: string;
  content?: string;
}

export interface CodeEditorViewRef {
  // setValue: (value: string) => void;
}

const CodeEditorView = forwardRef(
  (props: CodeEditorViewProps, ref: React.Ref<CodeEditorViewRef>) => {
    const [value, setValue] = useState(props.content ?? "");
    const onChange = (value: string) => {
      setValue(value);
    };

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
      // setValue: (value: string) => {
      //   setValue(value);
      // },
    }));

    return (
      <ViewLayout width={props.width} height={props.height}>
        <div className="h-full w-full overflow-hidden rounded-lg">
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
          {/* \n */}
        </div>
      </ViewLayout>
    );
  },
);

export default CodeEditorView;
