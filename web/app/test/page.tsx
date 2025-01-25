"use client";

import useExtensionManager from "@/lib/hooks/use-extensions";
import { usePlatformApi } from "@/lib/hooks/use-platform-api";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

export default function ModuleTest() {
  const cssPath = "/extensions/dist/globals.css";
  // Desktop
  const extensionPath =
    "C:/GitHub/pulse-editor/web/public/extensions/dist/bundle.js";
  // Web
  // const extensionPath = "http://localhost:3000/extensions/dist/bundle.js";
  // Mobile
  // const extensionPath = "capacitor://localhost/assets/extensions/dist/bundle.js";

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [extensionBlobUri, setExtensionBlobUri] = useState<string | null>(null);
  const { extensionManager } = useExtensionManager();

  useEffect(() => {
    if (extensionManager) {
      extensionManager.loadExtensionToBlobUri(extensionPath).then((blob) => {
        setExtensionBlobUri(blob);
        console.log("blob", blob);
      });
    }
  }, [extensionManager]);

  useEffect(() => {
    if (extensionBlobUri) {
      const Extension = dynamic(() =>
        import(/* webpackIgnore: true */ extensionBlobUri).then(
          (mod) => mod.default,
        ),
      );
      if (iframeRef.current) {
        const iframe = iframeRef.current;
        const iframeDoc =
          iframe.contentDocument || iframe.contentWindow?.document;

        if (iframeDoc) {
          iframeDoc.open();
          iframeDoc.write('<div id="extension-root"></div>');
          iframeDoc.close();

          const renderExtension = async () => {
            const root = iframeDoc.getElementById("extension-root");
            if (root) {
              const rootElement = createRoot(root, {});
              // Inject extension global styles into iframe
              const link = iframeDoc.createElement("link");
              link.rel = "stylesheet";
              link.href = cssPath;
              iframeDoc.head.appendChild(link);
              rootElement.render(<Extension />);
            }
          };

          renderExtension();
        }
      }
    }
  }, [extensionBlobUri]);

  return <iframe ref={iframeRef} />;
}
