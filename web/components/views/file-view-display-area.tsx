import { useContext, useEffect, useState } from "react";
import { EditorContext } from "../providers/editor-context-provider";
import { ViewManager } from "@/lib/views/view-manager";
import CodeEditorView from "./code-editor-view";
import { AnimatePresence, motion } from "framer-motion";
import { ViewTypeEnum } from "@/lib/views/available-views";
import { getPlatform } from "@/lib/platform-api/platform-checker";
import { PlatformEnum } from "@/lib/platform-api/available-platforms";
import { ViewDocument } from "@/lib/types";
import { View } from "@/lib/views/view";
import AgentChatTerminalView from "./agent-chat-terminal-view";

export default function ViewDisplayArea() {
  const editorContext = useContext(EditorContext);
  const [activeView, setActiveView] = useState<View | undefined>(undefined);

  // Initialize view manager
  useEffect(() => {
    if (!editorContext?.viewManager) {
      // If running in VSCode extension, notify VSCode that Pulse is ready,
      // and create view manager later when VSCode sends a message.
      if (getPlatform() === PlatformEnum.VSCode) {
        notifyVSCode();
        addVSCodeHandlers();
      } else {
        const viewManager = new ViewManager();
        editorContext?.setViewManager(viewManager);
      }
    }
  }, []);

  useEffect(() => {
    if (editorContext?.viewManager) {
      const activeView = editorContext.viewManager.getActiveView();
      console.log("Active view:", activeView?.viewDocument.filePath);
      setActiveView(activeView);
    }
  }, [editorContext?.viewManager]);

  function notifyVSCode() {
    window.parent.postMessage(
      {
        command: "pulseReady",
        from: "pulse",
      },
      "*",
    );
  }

  function addVSCodeHandlers() {
    // Listen for ctrl+alt+s to switch back to VSCode original editor
    window.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.altKey && e.code === "KeyS") {
        // Send a message to parent iframe
        window.parent.postMessage(
          { command: "switchToTextEditor", from: "pulse" },
          "*",
        );
      }
    });

    // Add a listener to listen messages from VSCode Extension
    window.addEventListener("message", (e) => {
      const message = e.data;
      if (message.command === "updatePulseText") {
        const text: string = message.text;
        console.log("Received text from VSCode:", text);
        const view = editorContext?.viewManager?.getActiveView();
        if (view) {
          view.updateViewDocument({
            fileContent: text,
          });
        }
      } else if (message.command === "openFile") {
        const text: string = message.text;
        const path: string = message.path;
        console.log(
          "Received file from VSCode. Path: " + path + " Text: " + text,
        );

        const doc: ViewDocument = {
          fileContent: text,
          filePath: path,
        };
        const newView = new View(ViewTypeEnum.Code, doc);
        // Send a message to parent iframe to notify changes made in Pulse
        const callback = (viewDocument: ViewDocument) => {
          if (!viewDocument) {
            return;
          }
          window.parent.postMessage(
            {
              command: "updateVSCodeText",
              text: viewDocument.fileContent,
              from: "pulse",
            },
            "*",
          );
        };
        newView.setViewDocumentChangeCallback(callback);

        // Add to view manager
        editorContext?.setViewManager((prev) => {
          const newVM = new ViewManager();
          newVM?.addView(newView);
          newVM?.setActiveView(newView);
          return newVM;
        });
      }
    });
  }

  return (
    <div className="flex h-full w-full flex-col p-1">
      <div className="flex h-full w-full flex-col items-start justify-between gap-1.5 overflow-hidden rounded-xl bg-default p-2">
        <div className={`min-h-0 w-full flex-grow`}>
          {!activeView ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-y-1 pb-12 text-default-foreground">
              <h1 className="text-center text-2xl font-bold">
                Welcome to Pulse Editor!
              </h1>
              <p className="text-center text-lg font-normal">
                Start by opening a file or project.
              </p>
            </div>
          ) : (
            <CodeEditorView
              key={activeView.viewDocument.filePath}
              ref={(ref) => {
                if (ref) activeView.viewRef = ref;
              }}
              width="100%"
              height="100%"
              view={activeView}
            />
          )}
        </div>

        <AnimatePresence>
          {editorContext?.editorStates?.isChatViewOpen && (
            <motion.div
              className="h-[60%] w-full flex-shrink-0"
              // Enter from bottom and exit to bottom
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              style={{
                paddingBottom: editorContext.editorStates.isToolbarOpen
                  ? "52px"
                  : "0px",
              }}
            >
              <AgentChatTerminalView
                ref={(ref) => {
                  // TODO: Refactor this to use view manager
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
