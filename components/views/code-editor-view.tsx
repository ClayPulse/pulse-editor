"use client";

import ReactCodeMirror, { EditorView } from "@uiw/react-codemirror";
import { useEffect, useState } from "react";
import { javascript } from "@codemirror/lang-javascript";
import ViewLayout from "./layout";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import { useTheme } from "next-themes";

export default function CodeEditorView({
  width = "100%",
  height = "100%",
}: {
  width?: string;
  height?: string;
}) {
  const initCode = `"use client";

import ReactCodeMirror from "@uiw/react-codemirror";
import { useState } from "react";
import { javascript } from "@codemirror/lang-javascript";

export default function CodeEditorView() {
  const [value, setValue] = useState('console.log("Hello, World!");');
  const onChange = (value: string) => {
    setValue(value);
  };
  return (
    <ReactCodeMirror
      value={value}
      onChange={onChange}
      height="200px"
      extensions={[javascript({ jsx: true })]}
    />
  );
}
`;
  const [value, setValue] = useState(initCode);
  const onChange = (value: string) => {
    setValue(value);
  };

  const [theme, setTheme] = useState(vscodeDark);

  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (resolvedTheme === "dark") {
      const newTheme = setTheme(vscodeDark);
    } else {
      setTheme(vscodeLight);
    }
  }, [resolvedTheme]);

  return (
    <ViewLayout width={width} height={height}>
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
      </div>
    </ViewLayout>
  );
}
