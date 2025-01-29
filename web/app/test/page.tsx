"use client";

import useExtensionManager from "@/lib/hooks/use-extensions";
import { ExtensionBlobInfo } from "@/lib/types";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

export default function Extension() {
  const params = useSearchParams();

  const name = params.get("name");

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const { extensionManager } = useExtensionManager();

  const [extensionBlobInfo, setExtensionBlobInfo] =
    useState<ExtensionBlobInfo | null>(null);

  useEffect(() => {
    if (extensionManager && name) {
      extensionManager.loadExtension(name).then((info) => {
        setExtensionBlobInfo(info);
      });
    }
  }, [extensionManager, name]);

  useEffect(() => {
    if (extensionBlobInfo) {
      const LoadedExtension = dynamic(() =>
        import(/* webpackIgnore: true */ extensionBlobInfo.bundleUri).then(
          (mod) => mod.default,
        ),
      );
      if (iframeRef.current) { 
        const iframe = iframeRef.current;
        const iframeDoc =
          iframe.contentDocument || iframe.contentWindow?.document;

        if (iframeDoc) {
          const renderExtension = async () => {
            iframeDoc.body.innerHTML = '<div id="extension-root"></div>';

            const root = iframeDoc.getElementById("extension-root");
            if (root) {
              const rootElement = createRoot(root, {});
              // Inject extension global styles into iframe
              const link = iframeDoc.createElement("link");
              link.rel = "stylesheet";
              link.href = extensionBlobInfo.cssUri;
              iframeDoc.head.appendChild(link);
              rootElement.render(<LoadedExtension />);
            }
          };

          renderExtension();
        }
      }
    }
  }, [extensionBlobInfo]);

  return <iframe ref={iframeRef} />;
}
