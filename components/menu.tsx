"use client";

import MenuToolbar from "./toolbars/menu-toolbar";
import { Button, colors, menu, Switch } from "@nextui-org/react";
import { AnimatePresence, motion } from "framer-motion";
import useMenuStatesContext from "@/lib/hooks/use-menu-states-context";
import {
  BounceLoader,
  ClockLoader,
  GridLoader,
  PuffLoader,
  PulseLoader,
  SyncLoader,
} from "react-spinners";

export default function Menu() {
  const { menuStates } = useMenuStatesContext();

  return (
    <div
      className={"grid h-fit w-full grid-cols-3 grid-rows-1 bg-default-400 p-2"}
    >
      <div>
        <MenuToolbar />
      </div>
      <div>
        <AnimatePresence>
          {menuStates?.isRecording && (
            <motion.div
              initial={{ y: -56 }}
              animate={{ y: 0 }}
              exit={{ y: -56 }}
              transition={{ duration: 0.1 }}
              className="flex h-full w-full items-center justify-center"
            >
              <div className="flex h-10 w-44 items-center rounded-full bg-content2 px-4">
                <div className="flex w-12 items-center justify-center">
                  {menuStates?.isListening ? (
                    <BounceLoader color={colors.red["300"]} size={24} />
                  ) : menuStates?.isThinking ? (
                    <PulseLoader color={colors.blue["300"]} size={8} />
                  ) : menuStates?.isSpeaking ? (
                    <PuffLoader color={colors.green["300"]} size={24} />
                  ) : (
                    <ClockLoader color={colors.black["300"]} size={24} />
                  )}
                </div>
                <p className="w-full text-center text-xl text-content2-foreground">
                  {menuStates?.isListening
                    ? "Listening"
                    : menuStates?.isThinking
                      ? "Thinking"
                      : menuStates.isSpeaking
                        ? "Speaking"
                        : "Waiting"}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div>
        <AnimatePresence>
          {menuStates?.isDrawing && (
            <motion.div
              initial={{ x: 100 }}
              animate={{ x: 0 }}
              exit={{ x: 100 }}
              transition={{ duration: 0.1 }}
              className="left-0 top-0 z-0 flex h-full w-full items-center justify-end space-x-2"
            >
              <Switch>Use Image Recognition</Switch>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
