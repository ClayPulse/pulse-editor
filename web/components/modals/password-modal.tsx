import {
  Button,
  Input,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { useContext, useState } from "react";
import toast from "react-hot-toast";
import { decrypt, encrypt } from "@/lib/security/simple-password";
import Icon from "../icon";
import ModalWrapper from "./modal-wrapper";
import { EditorContext } from "../providers/editor-context-provider";

export default function PasswordScreen({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const editorContext = useContext(EditorContext);
  const [password, setPassword] = useState<string | undefined>(undefined);

  return (
    <ModalWrapper
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title={
        editorContext?.persistSettings?.isPasswordSet
          ? "Enter your password"
          : "Set a password"
      }
    >
      <>
        <ModalBody>
          <Input
            endContent={<Icon name="lock" />}
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
              editorContext?.setPersistSettings(undefined);
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
              if (!editorContext?.persistSettings?.isPasswordSet) {
                // Set password if not already set
                const settings = editorContext?.persistSettings ?? {};
                editorContext?.setPersistSettings((prev) => {
                  return {
                    ...prev,
                    isPasswordSet: true,
                    password: password,
                  };
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
                editorContext?.setPersistSettings((prev) => {
                  return {
                    ...prev,
                    sttAPIKey: sttAPIKey,
                    llmAPIKey: llmAPIKey,
                    ttsAPIKey: ttsAPIKey,
                  };
                });
              } else {
                // Decrypt API tokens
                const encryptedSttAPIKey =
                  editorContext?.persistSettings?.sttAPIKey;
                const encryptedLlmAPIKey =
                  editorContext?.persistSettings?.llmAPIKey;
                const encryptedTtsAPIKey =
                  editorContext?.persistSettings?.ttsAPIKey;
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
                editorContext?.setPersistSettings((prev) => {
                  return {
                    ...prev,
                    sttAPIKey: sttAPIKey,
                    llmAPIKey: llmAPIKey,
                    ttsAPIKey: ttsAPIKey,
                    password: password,
                  };
                });
              }
            }}
          >
            Confirm
          </Button>
        </ModalFooter>
      </>
    </ModalWrapper>
  );
}
