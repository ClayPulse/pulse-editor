import { useContext } from "react";
import { EditorContext } from "@/components/providers/editor-context-provider";
import { usePlatformApi } from "./use-platform-api";

export default function useExplorer() {
  const { platformApi } = usePlatformApi();
  const editorContext = useContext(EditorContext);

  function selectAndSetProjectHome() {
    platformApi?.selectDir().then((path) => {
      if (path) {
        console.log("Selected path: ", path);
        editorContext?.setPersistSettings((prev) => {
          return {
            ...prev,
            projectHomePath: path,
          };
        });
      }
    });
  }

  return { selectAndSetProjectHome };
}
