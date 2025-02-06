import { ViewBoxMessage } from "@pulse-editor/types";
import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { loadRemote } from "@module-federation/runtime";
import React from "react";

export default function ExtensionLoader({
  remoteOrigin,
  moduleId,
  moduleVersion,
}: {
  remoteOrigin: string;
  moduleId: string;
  moduleVersion: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    function renderExtension(LoadedExtension: any) {
      if (iframeRef.current) {
        const iframe = iframeRef.current;
        const iframeDoc = iframe.contentWindow?.document;

        if (iframeDoc) {
          iframeDoc.body.innerHTML = '<div id="extension-root"></div>';

          const root = iframeDoc.getElementById("extension-root");
          if (root) {
            const rootElement = createRoot(root, {});
            // Inject extension global styles into iframe
            const link = iframeDoc.createElement("link");
            link.rel = "stylesheet";
            link.href = `${remoteOrigin}/${moduleId}/${moduleVersion}/__federation_expose_main.globals.css`;
            iframeDoc.head.appendChild(link);
            rootElement.render(<LoadedExtension />);
          }
        }
      }
    }

    loadRemote(`${moduleId}/main`).then((mod) => {
      // @ts-expect-error Types are not available since @module-federation/enhanced
      // cannot work in Nextjs App router. Hence types are not generated.
      const { default: LoadedExtension, Config } = mod;

      renderExtension(LoadedExtension);
    });
  }, []);

  return <iframe ref={iframeRef} className="h-full w-full" />;
}
