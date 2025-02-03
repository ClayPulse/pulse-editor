import {
  FileViewModel,
  messageTimeout,
  ViewBoxMessage,
  ViewBoxMessageTypeEnum,
} from "@pulse-editor/types";
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import Loading from "./loading";
import { MessageReceiver, MessageSender } from "@pulse-editor/shared-utils";
import { loadRemote } from "@module-federation/runtime";
import React from "react";
import { Extension } from "@/lib/types";

export default function ExtensionLoader({
  extension,
  model,
}: {
  extension: Extension;
  model?: FileViewModel;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [isLoaded, setIsLoaded] = useState(false);

  const handlerMap = new Map<
    ViewBoxMessageTypeEnum,
    (message: ViewBoxMessage) => Promise<void>
  >();

  handlerMap.set(
    ViewBoxMessageTypeEnum.Loading,
    async (message: ViewBoxMessage) => {
      const payload = JSON.parse(message.payload);
      setIsLoaded(payload.isLoaded);
    },
  );

  // Init sender ref once received initial message from iframe
  const [sender, setSender] = useState<MessageSender | null>(null);

  const [iframeWindow, setIframeWindow] = useState<Window | null>(null);

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      // Attach the handler for the ViewFile message
      const receiver = new MessageReceiver(
        handlerMap,
        iframeRef.current?.contentWindow,
      );

      const listener = (event: MessageEvent<ViewBoxMessage>) => {
        const message = event.data;
        console.log("Received message in main app", message);
        receiver.receiveMessage(message);
        const win = event.source as Window;
        if (!iframeWindow) {
          setIframeWindow(win);
        }
      };

      const addMessageListener = () => {
        window.addEventListener("message", listener);
      };

      const removeMessageListener = () => {
        window.removeEventListener("message", listener);
      };

      addMessageListener();

      return () => {
        removeMessageListener();
      };
    }
  }, [iframeRef]);

  useEffect(() => {
    if (!sender && iframeWindow) {
      const newSender = new MessageSender(iframeWindow, messageTimeout);
      setSender(newSender);
    }
  }, [iframeWindow, sender]);

  useEffect(() => {
    if (sender && model) {
      sender.sendMessage(
        ViewBoxMessageTypeEnum.ViewFile,
        JSON.stringify(model),
      );
      console.log("Sent message to iframe", model);
    }
  }, [model, sender]);

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
            link.href = `${extension.remoteOrigin}/${extension.config.id}/${extension.config.version}/__federation_expose_main.globals.css`;
            iframeDoc.head.appendChild(link);
            rootElement.render(<LoadedExtension />);
          }
        }
      }
    }

    loadRemote(`${extension.config.id}/main`).then((mod) => {
      // @ts-expect-error Types are not available since @module-federation/enhanced
      // cannot work in Nextjs App router. Hence types are not generated.
      const { default: LoadedExtension, Config } = mod;
      console.log(Config);

      renderExtension(LoadedExtension);
    });
  }, []);

  function hardRefresh() {
    navigator.serviceWorker.getRegistration().then(async (registration) => {
      if (!registration) return;
      await registration.unregister();
      window.location.reload();
    });
  }

  return (
    <div className="relative">
      {/* {!isLoaded && (
        <div className="absolute left-0 top-0 h-full w-full">
          <Loading />
        </div>
      )} */}

      <iframe ref={iframeRef} />
    </div>
  );
}
