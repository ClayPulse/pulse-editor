import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { LockIcon } from "./icons/lock";
import useMenuStatesContext from "@/lib/hooks/use-menu-states-context";
import { useState } from "react";
import toast from "react-hot-toast";
import { decrypt, encrypt } from "@/lib/security/simple-password";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";

export default function PasswordScreen({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const { menuStates, updateMenuStates } = useMenuStatesContext();
  const [password, setPassword] = useState<string | undefined>(undefined);
  const { getValue, setValue } = useLocalStorage();

  return (
    <Modal
      backdrop="opaque"
      isOpen={isOpen}
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: "easeOut",
            },
          },
          exit: {
            y: -20,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: "easeIn",
            },
          },
        },
      }}
      onClose={() => {
        setIsOpen(false);
      }}
      isDismissable={false}
    >
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1">
            {menuStates?.settings?.isPasswordSet
              ? "Enter your password"
              : "Set a password"}
          </ModalHeader>
          <ModalBody>
            <Input
              endContent={
                <LockIcon className="pointer-events-none flex-shrink-0 text-2xl text-default-400" />
              }
              label="Password"
              placeholder="Enter your password"
              type="password"
              variant="bordered"
              value={password ?? ""}
              onChange={(e) => setPassword(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              onPress={() => {
                setIsOpen(false);
                // Reset all settings
                updateMenuStates({
                  settings: undefined,
                });
              }}
              variant="light"
              disableRipple
              disableAnimation
            >
              Reset Config
            </Button>
            <Button
              color="primary"
              onPress={() => {
                if (!password) {
                  toast.error("Please enter password");
                  return;
                }

                setIsOpen(false);
                if (!menuStates?.settings?.isPasswordSet) {
                  // Set password if not already set
                  const settings = menuStates?.settings ?? {};
                  updateMenuStates({
                    settings: {
                      ...settings,
                      isPasswordSet: true,
                      password: password,
                    },
                  });
                  // Encrypt API tokens
                  const sttAPIKey = settings.sttAPIKey
                    ? encrypt(settings.sttAPIKey, password)
                    : undefined;
                  const llmAPIKey = settings.llmAPIKey
                    ? encrypt(settings.llmAPIKey, password)
                    : undefined;
                  const ttsAPIKey = settings.ttsAPIKey
                    ? encrypt(settings.ttsAPIKey, password)
                    : undefined;
                  // Save to local storage
                  setValue("sttAPIKey", sttAPIKey);
                  setValue("llmAPIKey", llmAPIKey);
                  setValue("ttsAPIKey", ttsAPIKey);
                } else {
                  // Decrypt API tokens
                  const encryptedSttAPIKey = getValue<string>("sttAPIKey");
                  const encryptedLlmAPIKey = getValue<string>("llmAPIKey");
                  const encryptedTtsAPIKey = getValue<string>("ttsAPIKey");
                  const sttAPIKey = encryptedSttAPIKey
                    ? decrypt(encryptedSttAPIKey, password)
                    : undefined;
                  const llmAPIKey = encryptedLlmAPIKey
                    ? decrypt(encryptedLlmAPIKey, password)
                    : undefined;
                  const ttsAPIKey = encryptedTtsAPIKey
                    ? decrypt(encryptedTtsAPIKey, password)
                    : undefined;

                  // Load password to context if the password was set
                  const settings = menuStates?.settings ?? {};
                  updateMenuStates({
                    settings: {
                      ...settings,
                      sttAPIKey: sttAPIKey,
                      llmAPIKey: llmAPIKey,
                      ttsAPIKey: ttsAPIKey,
                      password: password,
                    },
                  });
                }
              }}
            >
              Confirm
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
}
