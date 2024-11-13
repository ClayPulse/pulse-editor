"use client";

import { MenuStates } from "@/lib/interface";
import MenuToolbar from "./toolbars/menu-toolbar";
import { useEffect, useState } from "react";
import { Button, Switch } from "@nextui-org/react";
import { AnimatePresence, motion } from "framer-motion";

export default function Menu({
  onMenuStateChange,
}: {
  onMenuStateChange: (menuStates: MenuStates) => void;
}) {
  const [menuStates, setMenuStates] = useState({
    isDrawingMode: false,
  });

  useEffect(() => {
    onMenuStateChange(menuStates);
  }, [menuStates]);

  return (
    <div className={"relative h-fit w-full p-2"}>
      <AnimatePresence>
        {menuStates.isDrawingMode && (
          <motion.div
            initial={{ y: -56 }}
            animate={{ y: 0 }}
            exit={{ y: -56 }}
            transition={{ duration: 0.25 }}
            className="absolute left-0 top-0 z-0 flex h-full w-full items-center justify-end space-x-2 bg-default-400 p-2"
          >
            <Switch>Use Image Recognition</Switch>
            <Button>Advanced Interaction</Button>
          </motion.div>
        )}
      </AnimatePresence>
      <MenuToolbar menuStates={menuStates} setMenuStates={setMenuStates} />
    </div>
  );
}
