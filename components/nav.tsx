"use client";

import { Button, colors } from "@nextui-org/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BounceLoader,
  ClockLoader,
  PuffLoader,
  PulseLoader,
} from "react-spinners";
import Icon from "./icon";
import { useContext, useEffect, useState } from "react";
import PasswordScreen from "./modals/password-modal";
import { useTheme } from "next-themes";
import NavMenu from "./nav-menu";
import { EditorContext } from "./providers/editor-context-provider";
import { getPlatform } from "@/lib/platform-api/platform-checker";
import { PlatformEnum } from "@/lib/platform-api/available-platforms";
import Loading from "./loading";
import { CodeEditorViewRef } from "./views/code-editor-view";
import { ViewDocument } from "@/lib/types";

export default function Nav({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  const editorContext = useContext(EditorContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPasswordScreenOpen, setIsPasswordScreenOpen] = useState(false);

  const { theme, setTheme } = useTheme();

  const [isShowNavbar, setIsShowNavbar] = useState(true);

  useEffect(() => {
    const platform = getPlatform();
    // Hide NavMenu if opened in VSCode Extension,
    // rely on VSCode's native navigation instead.
    console.log("Platform:", platform);
    if (platform === PlatformEnum.VSCode) {
      setIsShowNavbar(false);

      // Also check the if a theme token is passed from VSCode Extension.
      const vscodeTheme =
        new URLSearchParams(window.location.search).get("theme") ?? "dark";
      setTheme(vscodeTheme);

      addVSCodeHandlers();
    }

    setMounted(true);
  }, []);

  // Open PasswordScreen if password is set
  useEffect(() => {
    if (
      editorContext?.persistSettings?.isUsePassword &&
      !editorContext?.persistSettings?.password
    ) {
      setIsPasswordScreenOpen(true);
    }
  }, [editorContext?.persistSettings]);

  // If the component is not mounted, the theme can't be determined.
  if (!mounted) {
    return <Loading />;
  }

  function addVSCodeHandlers() {
    // Listen for ctrl+alt+s to switch back to VSCode original editor
    window.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.altKey && e.code === "KeyS") {
        // Send a message to parent iframe
        window.parent.postMessage(
          { command: "switchToTextEditor", from: "chisel" },
          "*",
        );
      }
    });

    // Add a listener to listen messages from VSCode Extension
    window.addEventListener("message", (e) => {
      const message = e.data;
      if (message.command === "updateChiselText") {
        const text: string = message.text;
        console.log("Received text from VSCode:", text);
        const view = editorContext?.getViewById("1") as CodeEditorViewRef;
        if (view) {
          view.setViewDocument((prev) => {
            if (!prev) {
              return undefined;
            }
            return {
              ...prev,
              fileContent: text,
            };
          });
        }
      } else if (message.command === "openFile") {
        const text: string = message.text;
        const path: string = message.path;
        console.log(
          "Received file from VSCode. Path: " + path + " Text: " + text,
        );
        const view = editorContext?.getViewById("1") as CodeEditorViewRef;
        if (view) {
          const newDoc: ViewDocument = {
            fileContent: text,
            filePath: path,
          };
          view.setViewDocument(newDoc);

          // Send a message to parent iframe to notify changes made in Chisel
          const callback = (viewDocument: ViewDocument | undefined) => {
            if (!viewDocument) {
              return;
            }
            window.parent.postMessage(
              {
                command: "updateVSCodeText",
                text: viewDocument.fileContent,
                from: "chisel",
              },
              "*",
            );
          };
          view.setViewDocumentChangeCallback(callback);
        }
      }
    });

    // Notify VSCode that Chisel is ready
    window.parent.postMessage(
      {
        command: "chiselReady",
        from: "chisel",
      },
      "*",
    );
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-x-hidden">
      <PasswordScreen
        isOpen={isPasswordScreenOpen}
        setIsOpen={setIsPasswordScreenOpen}
      />

      {isShowNavbar && (
        <div className="fixed z-40 h-12 w-full">
          <div
            className={
              "grid h-12 w-full grid-cols-3 grid-rows-1 bg-default px-2 py-1 text-default-foreground"
            }
          >
            <div className="col-start-1">
              <Button
                isIconOnly
                onPress={() => {
                  setIsMenuOpen(!isMenuOpen);
                }}
                disableRipple
                variant="light"
              >
                {isMenuOpen ? (
                  <Icon name="close" variant="round" />
                ) : (
                  <Icon name="menu" variant="round" />
                )}
              </Button>
            </div>
            <div className="col-start-2">
              <AnimatePresence>
                {editorContext?.editorStates?.isRecording && (
                  <motion.div
                    initial={{ y: -56 }}
                    animate={{ y: 0 }}
                    exit={{ y: -56 }}
                    transition={{ duration: 0.1 }}
                    className="flex h-full w-full items-center justify-center"
                  >
                    <div className="flex h-10 w-40 items-center rounded-full bg-content2 px-4">
                      <div className="flex w-12 items-center justify-center">
                        {editorContext?.editorStates?.isListening ? (
                          <BounceLoader color={colors.red["300"]} size={24} />
                        ) : editorContext?.editorStates?.isThinking ? (
                          <PulseLoader color={colors.blue["300"]} size={8} />
                        ) : editorContext?.editorStates?.isSpeaking ? (
                          <PuffLoader color={colors.green["300"]} size={24} />
                        ) : (
                          <ClockLoader
                            className="!shadow-[0px_0px_0px_2px_inset] !shadow-content2-foreground [&>span]:!bg-content2-foreground"
                            size={24}
                          />
                        )}
                      </div>
                      <p className="w-full text-center text-xl text-content2-foreground">
                        {editorContext?.editorStates?.isListening
                          ? "Listening"
                          : editorContext?.editorStates?.isThinking
                            ? "Thinking"
                            : editorContext?.editorStates.isSpeaking
                              ? "Speaking"
                              : "Waiting"}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="col-start-3 flex justify-end">
              <Button
                // Disable on hover background
                className="data-[hover=true]:bg-transparent"
                isIconOnly
                disableRipple
                variant="light"
                onPress={() => {
                  setTheme(theme === "dark" ? "light" : "dark");
                }}
              >
                {theme === "dark" ? (
                  <Icon name="dark_mode" variant="round" />
                ) : (
                  <Icon name="light_mode" variant="round" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div
        className={`flex h-full w-full overflow-hidden ${isShowNavbar ? "pt-[48px]" : ""}`}
      >
        <NavMenu isMenuOpen={isMenuOpen} />

        <div className="min-w-0 flex-grow">{children}</div>
      </div>
    </div>
  );
}
