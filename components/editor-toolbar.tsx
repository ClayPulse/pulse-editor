import { Button, Divider, Tooltip } from "@nextui-org/react";
import useEditorStatesContext from "@/lib/hooks/use-editor-states-context";
import { useState } from "react";
import Icon from "@/components/icon";
import SettingModal from "@/components/modals/settings-modal";
import { AnimatePresence, motion } from "framer-motion";

export default function EditorToolbar() {
  const { editorStates, updateEditorStates } = useEditorStatesContext();
  const [isOpen, setIsOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div
      className={
        "fixed bottom-0 left-0 z-10 flex w-full flex-col items-center justify-center space-y-0.5 pb-1"
      }
    >
      <AnimatePresence>
        {isOpen && (
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
                    if (editorStates) {
                      updateEditorStates({ isDrawing: !editorStates.isDrawing });
                    }
                  }}
                  variant={editorStates?.isDrawing ? "solid" : "light"}
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
              {/* <Button variant="light"
      isIconOnly
      className="h-8 w-8 min-w-8 px-1 py-1 text-default-foreground"
    >
      <IconErase />
    </Button> */}

              <Divider className="mx-1" orientation="vertical" />
              <Tooltip content={"Open Chat View"}>
                <Button
                  variant="light"
                  isIconOnly
                  className="h-8 w-8 min-w-8 px-1 py-1 text-default-foreground"
                  onPress={() => {
                    if (editorStates) {
                      updateEditorStates({
                        isOpenChatView: !editorStates.isOpenChatView,
                      });
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
                    if (editorStates) {
                      updateEditorStates({
                        isRecording: !editorStates.isRecording,
                      });
                    }
                  }}
                  variant={editorStates?.isRecording ? "solid" : "light"}
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
                >
                  <Icon name="smart_toy" variant="outlined" />
                </Button>
              </Tooltip>

              <Tooltip content={"Discover Extensions"}>
                <Button
                  variant="light"
                  isIconOnly
                  className="h-8 w-8 min-w-8 px-1 py-1 text-default-foreground"
                >
                  <Icon name="dashboard_customize" variant="outlined" />
                </Button>
              </Tooltip>

              {/* <SettingPopover /> */}
              <Tooltip content="Settings">
                <Button
                  variant="light"
                  isIconOnly
                  className="h-8 w-8 min-w-8 px-1 py-1 text-default-foreground"
                  onPress={() => setIsSettingsOpen(true)}
                >
                  <Icon name="settings" variant="outlined" />
                </Button>
              </Tooltip>
              <SettingModal
                isOpen={isSettingsOpen}
                setIsOpen={setIsSettingsOpen}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen ? (
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
