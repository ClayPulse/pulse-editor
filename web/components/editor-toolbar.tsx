"use client";

import { Button, Divider, Tooltip } from "@nextui-org/react";
import { useContext, useState } from "react";
import Icon from "@/components/icon";
import AppSettingsModal from "@/components/modals/app-settings-modal";
import { AnimatePresence, motion } from "framer-motion";
import { EditorContext } from "./providers/editor-context-provider";
import { getPlatform } from "@/lib/platform-api/platform-checker";
import { PlatformEnum } from "@/lib/platform-api/available-platforms";
import toast from "react-hot-toast";
import ExtensionModal from "./modals/extension-modal";
import AgentConfigModal from "./modals/agent-config-modal";

export default function EditorToolbar() {
  const editorContext = useContext(EditorContext);

  const [isAgentListModalOpen, setIsAgentListModalOpen] = useState(false);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
  const [isAppSettingsModalOpen, setAppIsSettingsModalOpen] = useState(false);

  function setIsOpen(val: boolean) {
    if (editorContext) {
      editorContext.setEditorStates((prev) => ({
        ...prev,
        isToolbarOpen: val,
      }));
    }
  }

  return (
    <div
      className={
        "fixed bottom-0 left-1/2 z-10 flex w-fit -translate-x-1/2 flex-col items-center justify-center space-y-0.5 pb-1"
      }
    >
      <AnimatePresence>
        {editorContext?.editorStates.isToolbarOpen && (
          <motion.div
            initial={{
              y: 60,
            }}
            animate={{
              y: 0,
            }}
            exit={{
              y: 80,
            }}
          >
            <div className="relative flex h-10 w-fit items-center rounded-full bg-content2 px-2 py-1 shadow-md">
              <Tooltip content={"Pen Tool"}>
                <Button
                  isIconOnly
                  className="h-8 w-8 min-w-8 px-1 py-1 text-default-foreground"
                  onPress={() => {
                    if (editorContext?.editorStates) {
                      editorContext?.setEditorStates((prev) => ({
                        ...prev,
                        isDrawing: !editorContext?.editorStates.isDrawing,
                      }));
                    }
                  }}
                  variant={
                    editorContext?.editorStates?.isDrawing ? "solid" : "light"
                  }
                >
                  <Icon name="edit" variant="round" />
                </Button>
              </Tooltip>
              <Tooltip content={"Inline Chat Tool"}>
                <Button
                  variant="light"
                  isIconOnly
                  className="h-8 w-8 min-w-8 px-1 py-1 text-default-foreground"
                >
                  <Icon name="comment" variant="outlined" />
                </Button>
              </Tooltip>

              <Divider className="mx-1" orientation="vertical" />
              <Tooltip content={"Open Chat View"}>
                <Button
                  variant={
                    editorContext?.editorStates?.isChatViewOpen
                      ? "solid"
                      : "light"
                  }
                  isIconOnly
                  className="h-8 w-8 min-w-8 px-1 py-1 text-default-foreground"
                  onPress={() => {
                    if (editorContext?.editorStates) {
                      editorContext?.setEditorStates((prev) => ({
                        ...prev,
                        isChatViewOpen:
                          !editorContext?.editorStates.isChatViewOpen,
                      }));
                    }
                  }}
                >
                  <Icon name="forum" variant="outlined" />
                </Button>
              </Tooltip>

              <Tooltip content={"Voice Chat With Agent"}>
                <Button
                  isIconOnly
                  className="h-8 w-8 min-w-8 px-1 py-1 text-default-foreground"
                  onPress={() => {
                    if (getPlatform() === PlatformEnum.VSCode) {
                      toast.error(
                        "Voice Chat is not supported in VSCode Extension. Please use other versions for Voice Chat.",
                      );
                      return;
                    }

                    if (editorContext?.editorStates) {
                      editorContext?.setEditorStates((prev) => ({
                        ...prev,
                        isRecording: !editorContext?.editorStates.isRecording,
                      }));
                    }
                  }}
                  variant={
                    editorContext?.editorStates?.isRecording ? "solid" : "light"
                  }
                >
                  <Icon name="mic" variant="outlined" />
                </Button>
              </Tooltip>

              <Tooltip content={"Agent Speech Volume"}>
                <Button
                  variant="light"
                  isIconOnly
                  className="h-8 w-8 min-w-8 px-1 py-1 text-default-foreground"
                >
                  <Icon name="volume_up" variant="outlined" />
                </Button>
              </Tooltip>

              <Divider className="mx-1" orientation="vertical" />

              <Tooltip content={"Agent Configuration"}>
                <Button
                  variant="light"
                  isIconOnly
                  className="h-8 w-8 min-w-8 px-1 py-1 text-default-foreground"
                  onPress={() => {
                    setIsAgentListModalOpen(true);
                  }}
                >
                  <Icon name="smart_toy" variant="outlined" />
                </Button>
              </Tooltip>
              <AgentConfigModal
                isOpen={isAgentListModalOpen}
                setIsOpen={setIsAgentListModalOpen}
              />

              <Tooltip content={"Discover Extensions"}>
                <Button
                  variant="light"
                  isIconOnly
                  className="h-8 w-8 min-w-8 px-1 py-1 text-default-foreground"
                  onPress={() => {
                    setIsExtensionModalOpen(true);
                  }}
                >
                  <Icon name="dashboard_customize" variant="outlined" />
                </Button>
              </Tooltip>
              <ExtensionModal
                isOpen={isExtensionModalOpen}
                setIsOpen={setIsExtensionModalOpen}
              />

              {/* <SettingPopover /> */}
              <Tooltip content="Settings">
                <Button
                  variant="light"
                  isIconOnly
                  className="h-8 w-8 min-w-8 px-1 py-1 text-default-foreground"
                  onPress={() => setAppIsSettingsModalOpen(true)}
                >
                  <Icon name="settings" variant="outlined" />
                </Button>
              </Tooltip>
              <AppSettingsModal
                isOpen={isAppSettingsModalOpen}
                setIsOpen={setAppIsSettingsModalOpen}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {editorContext?.editorStates.isToolbarOpen ? (
        <Button
          isIconOnly
          className="h-4 w-10 bg-content2"
          onPress={() => {
            setIsOpen(false);
          }}
        >
          <Icon
            name="keyboard_arrow_down"
            className="text-content2-foreground"
          />
        </Button>
      ) : (
        <Button
          isIconOnly
          className="h-4 w-10 bg-content2"
          onPress={() => {
            setIsOpen(true);
          }}
        >
          <Icon name="keyboard_arrow_up" className="text-content2-foreground" />
        </Button>
      )}
    </div>
  );
}
