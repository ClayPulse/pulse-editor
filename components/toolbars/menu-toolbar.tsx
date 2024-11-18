import { Button, Divider } from "@nextui-org/react";
import ToolbarLayout from "./layout";
import { MenuStates } from "@/lib/interface";
import IconPen from "../icons/pen";
import IconComment from "../icons/comment";
import IconErase from "../icons/erase";
import IconMicrophone from "../icons/microphone";
import IconSpeaker from "../icons/speaker";
import IconAgent from "../icons/agent";
import IconApps from "../icons/apps";
import IconSettings from "../icons/settings";

export default function MenuToolbar({
  menuStates,
  setMenuStates,
}: {
  menuStates: MenuStates;
  setMenuStates: (menuStates: MenuStates) => void;
}) {
  return (
    <ToolbarLayout>
      <Button
        isIconOnly
        className="h-8 w-8 min-w-8 px-1 py-1 text-default-foreground"
        onClick={() => {
          setMenuStates({
            ...menuStates,
            isDrawingMode: !menuStates.isDrawingMode,
          });
        }}
        variant={menuStates.isDrawingMode ? "faded" : "solid"}
      >
        <IconPen />
      </Button>
      <Button
        isIconOnly
        className="h-8 w-8 min-w-8 px-1 py-1 text-default-foreground"
      >
        <IconComment />
      </Button>
      <Button
        isIconOnly
        className="h-8 w-8 min-w-8 px-1 py-1 text-default-foreground"
      >
        <IconErase />
      </Button>

      <Divider className="mx-1" orientation="vertical" />
      <Button
        isIconOnly
        className="h-8 w-8 min-w-8 px-1 py-1 text-default-foreground"
        onClick={() => {
          setMenuStates({
            ...menuStates,
            isRecording: !menuStates.isRecording,
          });
        }}
        variant={menuStates.isRecording ? "faded" : "solid"}
      >
        <IconMicrophone />
      </Button>

      <Button
        isIconOnly
        className="h-8 w-8 min-w-8 px-1 py-1 text-default-foreground"
      >
        <IconSpeaker />
      </Button>

      <Divider className="mx-1" orientation="vertical" />

      <Button
        isIconOnly
        className="h-8 w-8 min-w-8 px-1 py-1 text-default-foreground"
      >
        <IconAgent />
      </Button>
      <Button
        isIconOnly
        className="h-8 w-8 min-w-8 px-1 py-1 text-default-foreground"
      >
        <IconApps />
      </Button>
      <Button
        isIconOnly
        className="h-8 w-8 min-w-8 px-1 py-1 text-default-foreground"
      >
        <IconSettings />
      </Button>
    </ToolbarLayout>
  );
}
