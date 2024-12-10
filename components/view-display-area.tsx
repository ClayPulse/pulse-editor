import { useContext, useEffect, useState } from "react";
import { EditorContext } from "./providers/editor-context-provider";
import { ViewManager } from "@/lib/views/view-manager";
import CodeEditorView from "./views/code-editor-view";
import { AnimatePresence, motion } from "framer-motion";
import AgentChatTerminalView from "./views/agent-chat-terminal-view";
import { ViewTypeEnum } from "@/lib/views/available-views";
import { getPlatform } from "@/lib/platform-api/platform-checker";
import { PlatformEnum } from "@/lib/platform-api/available-platforms";

export default function ViewDisplayArea() {
  const editorContext = useContext(EditorContext);

  // Initialize view manager
  useEffect(() => {
    if (!editorContext?.viewManager) {
      // If running in VSCode extension, notify VSCode that Chisel is ready,
      // and create view manager later when VSCode sends a message.
      if (getPlatform() === PlatformEnum.VSCode) {
        window.parent.postMessage(
          {
            command: "chiselReady",
            from: "chisel",
          },
          "*",
        );
      } else {
        const viewManager = new ViewManager();
        editorContext?.setViewManager(viewManager);
      }
    }
  }, []);

  return (
    <div className="flex h-full w-full flex-col p-1">
      <div className="flex h-full w-full flex-col items-start justify-between gap-1.5 overflow-hidden rounded-xl bg-default p-2">
        <div className={`min-h-0 w-full flex-grow`}>
          {editorContext?.viewManager?.viewCount() === 0 ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-y-1 pb-12 text-default-foreground">
              <h1 className="text-center text-2xl font-bold">
                Welcome to Chisel Editor!
              </h1>
              <p className="text-center text-lg font-normal">
                Start by opening a file or project.
              </p>
            </div>
          ) : (
            editorContext?.viewManager
              ?.getViewByType(ViewTypeEnum.Code)
              .map((view, index) => (
                <CodeEditorView
                  key={index}
                  ref={(ref) => {
                    if (ref) view.viewRef = ref;
                  }}
                  width="100%"
                  height="100%"
                  view={view}
                />
              ))
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
