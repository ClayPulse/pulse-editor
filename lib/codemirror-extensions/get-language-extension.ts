import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { Extension } from "@uiw/react-codemirror";

export function getLanguageExtension(filename: string): Extension | undefined {
  if (filename.endsWith(".js")) {
    return javascript();
  }
  else if (filename.endsWith(".ts")) { 
    return javascript({typescript: true});
  }
  else if (filename.endsWith(".jsx")) {
    return javascript({jsx: true});
  }
  else if (filename.endsWith(".tsx")) {
    return javascript({jsx: true, typescript: true});
  }
  else if (filename.endsWith(".py")) {
    return python();
  }

  return undefined;
}
