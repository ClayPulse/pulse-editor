import {
  Button,
  Chip,
  tv,
  useCheckbox,
  VisuallyHidden,
} from "@nextui-org/react";
import ModalWrapper from "./modal-wrapper";
import Icon from "../icon";
import { ExtensionConfig } from "@/lib/types";
import useExtensionManager from "@/lib/hooks/use-extensions";
import { usePlatformApi } from "@/lib/hooks/use-platform-api";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { ExtensionManager } from "@/lib/extensions/extension-manager";

function EnableCheckBox({
  isEnabled,
  toggleExtension,
}: {
  isEnabled: boolean;
  toggleExtension: () => void;
}) {
  const { children, isSelected, getBaseProps, getLabelProps, getInputProps } =
    useCheckbox({
      onValueChange: toggleExtension,
      isSelected: isEnabled,
    });

  const checkbox = tv({
    slots: {
      base: "hover:bg-default-200 dark:hover:bg-default-300 w-[96px] max-w-[96px] min-w-[96px]",
      content: "text-default-500 text-sm pl-0.5",
    },
    variants: {
      isSelected: {
        true: {
          base: "bg-primary hover:bg-primary-400 dark:hover:bg-primary-300",
          content: "text-primary-foreground",
        },
      },
    },
  });

  const styles = checkbox({ isSelected });

  return (
    <label {...getBaseProps()}>
      <VisuallyHidden>
        <input {...getInputProps()} />
      </VisuallyHidden>
      <Chip
        classNames={{
          base: styles.base(),
          content: styles.content(),
        }}
        color="primary"
        startContent={
          isSelected ? (
            <Icon
              name="check_circle_outline"
              className="!text-success-300 dark:!text-success-400"
            />
          ) : (
            <Icon name="block" className="!text-danger" />
          )
        }
        variant="faded"
        {...getLabelProps()}
      >
        {children ? children : isSelected ? "Enabled" : "Disabled"}
      </Chip>
    </label>
  );
}

function ExtensionPreview({
  extension,
  manager,
}: {
  extension: ExtensionConfig;
  manager?: ExtensionManager;
}) {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    manager?.isExtensionEnabled(extension.name).then((enabled) => {
      setIsEnabled(enabled);
    });
  }, [extension]);

  function toggleExtension() {
    if (isEnabled) {
      manager?.disableExtension(extension.name).then(() => {
        setIsEnabled(false);
      });
      toast.success("Extension disabled");
    } else {
      manager?.enableExtension(extension.name).then(() => {
        setIsEnabled(true);
      });
      toast.success("Extension enabled");
    }
  }

  return (
    <div className="w-full">
      <div className="relative h-28 w-full">
        <div className="absolute right-0.5 top-0 z-10">
          <EnableCheckBox
            isEnabled={isEnabled}
            toggleExtension={toggleExtension}
          />
        </div>
        <Button className="m-0 h-full w-full rounded-md p-0"></Button>
      </div>
      <p className="text-center">{extension.name}</p>
    </div>
  );
}

export default function ExtensionModal({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) {
  const { extensionManager } = useExtensionManager();
  const { platformApi } = usePlatformApi();

  const [extensions, setExtensions] = useState<ExtensionConfig[]>([]);

  useEffect(() => {
    if (isOpen) {
      extensionManager?.listExtensions().then((exts) => {
        setExtensions(exts);
      });
    }
  }, [isOpen]);

  return (
    <ModalWrapper
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title={"Extension Marketplace"}
    >
      <div className="h-full w-full space-y-2 overflow-y-auto px-2">
        <Button
          className="w-full"
          onPress={() => {
            platformApi?.selectPath().then((uri) => {
              if (uri) {
                extensionManager
                  ?.importLocalExtension(uri)
                  .then(() => {
                    toast.success("Extension imported successfully");
                    extensionManager?.listExtensions().then((exts) => {
                      setExtensions(exts);
                    });
                  })
                  .catch((e: Error) => {
                    toast.error(e.message);
                  });
              }
            });
          }}
        >
          Import Local Extension
        </Button>

        <div className="grid grid-cols-2 gap-1">
          {extensions.map((ext) => (
            <ExtensionPreview
              extension={ext}
              key={ext.name}
              manager={extensionManager}
            />
          ))}
        </div>
      </div>
    </ModalWrapper>
  );
}
