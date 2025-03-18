"use client";

import { ContextMenuState } from "@/lib/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@heroui/react";
import { JSX } from "react";

export default function ContextMenu({
  children,
  state,
  setState,
}: {
  children: JSX.Element;
  state: ContextMenuState;
  setState: (state: ContextMenuState) => void;
}) {

  return (
    <div
      className="absolute"
      style={{
        top: state.y,
        left: state.x,
      }}
    >
      <Popover
        onClose={() => {
          setState({ isOpen: false, x: 0, y: 0 });
        }}
        isOpen={state.isOpen}
        placement="bottom-start"
      >
        <PopoverTrigger>
          <div className="h-0 w-0 bg-red-500"></div>
        </PopoverTrigger>
        <PopoverContent className="p-2">{children}</PopoverContent>
      </Popover>
    </div>
  );
}
