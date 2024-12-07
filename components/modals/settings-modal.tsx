import {
  Divider,
  Input,
  Select,
  SelectItem,
  Switch,
  Tooltip,
} from "@nextui-org/react";
import { useContext, useState } from "react";
import { llmProviderOptions } from "@/lib/llm/options";
import { sttProviderOptions } from "@/lib/stt/options";
import { ttsProviderOptions } from "@/lib/tts/options";
import toast from "react-hot-toast";
import ModalWrapper from "./modal-wrapper";
import { EditorContext } from "../providers/editor-context-provider";
import { PersistSettings } from "@/lib/types";

export default function SettingModal({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) {
  const editorContext = useContext(EditorContext);
  const [ttl, setTTL] = useState<string>("14");

  function updateEditorSettings({
    settings,
  }: {
    settings: Partial<PersistSettings> | undefined;
  }) {
    editorContext?.setPersistSettings((prev) => ({
      ...prev,
      ...settings,
    }));
  }

  return (
    <ModalWrapper isOpen={isOpen} setIsOpen={setIsOpen}>
      <>
        <p className="text-center text-lg font-bold text-foreground">
          Settings
        </p>
        <div className="mt-2 flex w-full flex-col gap-2">
          <div>
            <p className="text-small text-foreground">STT</p>
            <div className="w-full space-y-2">
              <Select
                items={sttProviderOptions}
                disabledKeys={sttProviderOptions
                  .filter((provider) => !provider.isSupported)
                  .map((provider) => provider.provider)}
                label="Provider"
                placeholder="Select a provider"
                onChange={(e) => {
                  updateEditorSettings({
                    settings: {
                      sttProvider: e.target.value,
                      sttModel: undefined,
                      sttAPIKey: undefined,
                    },
                  });
                }}
                isRequired
                selectedKeys={
                  editorContext?.persistSettings?.sttProvider
                    ? [editorContext?.persistSettings.sttProvider]
                    : []
                }
              >
                {(providerOption) => (
                  <SelectItem key={providerOption.provider}>
                    {providerOption.provider}
                  </SelectItem>
                )}
              </Select>
              <Select
                isDisabled={!editorContext?.persistSettings?.sttProvider}
                items={
                  sttProviderOptions.find(
                    (provider) =>
                      provider.provider ===
                      editorContext?.persistSettings?.sttProvider,
                  )?.models ?? []
                }
                disabledKeys={
                  sttProviderOptions
                    .find(
                      (provider) =>
                        provider.provider ===
                        editorContext?.persistSettings?.sttProvider,
                    )
                    ?.models.filter((model) => !model.isSupported)
                    .map((model) => model.model) ?? []
                }
                label="Model"
                placeholder="Select a model"
                isRequired
                selectedKeys={
                  editorContext?.persistSettings?.sttModel
                    ? [editorContext?.persistSettings.sttModel]
                    : []
                }
                onChange={(e) => {
                  updateEditorSettings({
                    settings: {
                      sttModel: e.target.value,
                    },
                  });
                }}
              >
                {(modelOption) => (
                  <SelectItem key={modelOption.model}>
                    {modelOption.model}
                  </SelectItem>
                )}
              </Select>
              <Tooltip
                content={
                  <p>
                    Please disable password to edit API Key. <br />
                    You can enable password again after editing API keys.
                  </p>
                }
                isDisabled={!editorContext?.persistSettings?.isUsePassword}
              >
                <Input
                  label="API Key"
                  size="md"
                  isRequired
                  value={editorContext?.persistSettings?.sttAPIKey ?? ""}
                  onValueChange={(value) => {
                    updateEditorSettings({
                      settings: {
                        sttAPIKey: value,
                      },
                    });
                  }}
                  isDisabled={!editorContext?.persistSettings?.sttProvider}
                  isReadOnly={editorContext?.persistSettings?.isUsePassword}
                />
              </Tooltip>
            </div>
          </div>
          <Divider />
          <div>
            <p className="text-small text-foreground">LLM</p>
            <div className="w-full space-y-2">
              <Select
                items={llmProviderOptions}
                disabledKeys={llmProviderOptions
                  .filter((provider) => !provider.isSupported)
                  .map((provider) => provider.provider)}
                label="Provider"
                placeholder="Select a provider"
                onChange={(e) => {
                  updateEditorSettings({
                    settings: {
                      llmProvider: e.target.value,
                      llmModel: undefined,
                      llmAPIKey: undefined,
                    },
                  });
                }}
                isRequired
                selectedKeys={
                  editorContext?.persistSettings?.llmProvider
                    ? [editorContext?.persistSettings.llmProvider]
                    : []
                }
              >
                {(providerOption) => (
                  <SelectItem key={providerOption.provider}>
                    {providerOption.provider}
                  </SelectItem>
                )}
              </Select>
              <Select
                isDisabled={!editorContext?.persistSettings?.llmProvider}
                items={
                  llmProviderOptions.find(
                    (provider) =>
                      provider.provider ===
                      editorContext?.persistSettings?.llmProvider,
                  )?.models ?? []
                }
                disabledKeys={
                  llmProviderOptions
                    .find(
                      (provider) =>
                        provider.provider ===
                        editorContext?.persistSettings?.llmProvider,
                    )
                    ?.models.filter((model) => !model.isSupported)
                    .map((model) => model.model) ?? []
                }
                label="Model"
                placeholder="Select a model"
                isRequired
                onChange={(e) => {
                  updateEditorSettings({
                    settings: {
                      llmModel: e.target.value,
                    },
                  });
                }}
                selectedKeys={
                  editorContext?.persistSettings?.llmModel
                    ? [editorContext?.persistSettings?.llmModel]
                    : []
                }
              >
                {(modelOption) => (
                  <SelectItem key={modelOption.model}>
                    {modelOption.model}
                  </SelectItem>
                )}
              </Select>
              <Tooltip
                content={
                  <p>
                    Please disable password to edit API Key. <br />
                    You can enable password again after editing API keys.
                  </p>
                }
                isDisabled={!editorContext?.persistSettings?.isUsePassword}
              >
                <Input
                  label="API Key"
                  size="md"
                  isRequired
                  value={editorContext?.persistSettings?.llmAPIKey ?? ""}
                  onValueChange={(value) => {
                    updateEditorSettings({
                      settings: {
                        llmAPIKey: value,
                      },
                    });
                  }}
                  isDisabled={!editorContext?.persistSettings?.llmProvider}
                  isReadOnly={editorContext?.persistSettings?.isUsePassword}
                />
              </Tooltip>
            </div>
          </div>
          <Divider />
          <div>
            <p className="text-small text-foreground">TTS</p>
            <div className="w-full space-y-2">
              <Select
                items={ttsProviderOptions}
                disabledKeys={ttsProviderOptions
                  .filter((provider) => !provider.isSupported)
                  .map((provider) => provider.provider)}
                label="Provider"
                placeholder="Select a provider"
                onChange={(e) => {
                  updateEditorSettings({
                    settings: {
                      ttsProvider: e.target.value,
                      ttsModel: undefined,
                      ttsAPIKey: undefined,
                    },
                  });
                }}
                isRequired
                selectedKeys={
                  editorContext?.persistSettings?.ttsProvider
                    ? [editorContext?.persistSettings?.ttsProvider]
                    : []
                }
              >
                {(providerOption) => (
                  <SelectItem key={providerOption.provider}>
                    {providerOption.provider}
                  </SelectItem>
                )}
              </Select>
              <Select
                isDisabled={!editorContext?.persistSettings?.ttsProvider}
                items={
                  ttsProviderOptions.find(
                    (provider) =>
                      provider.provider ===
                      editorContext?.persistSettings?.ttsProvider,
                  )?.models ?? []
                }
                disabledKeys={
                  ttsProviderOptions
                    .find(
                      (provider) =>
                        provider.provider ===
                        editorContext?.persistSettings?.ttsProvider,
                    )
                    ?.models.filter((model) => !model.isSupported)
                    .map((model) => model.model) ?? []
                }
                label="Model"
                placeholder="Select a model"
                isRequired
                onChange={(e) => {
                  updateEditorSettings({
                    settings: {
                      ttsModel: e.target.value,
                    },
                  });
                }}
                selectedKeys={
                  editorContext?.persistSettings?.ttsModel
                    ? [editorContext?.persistSettings?.ttsModel]
                    : []
                }
              >
                {(modelOption) => (
                  <SelectItem key={modelOption.model}>
                    {modelOption.model}
                  </SelectItem>
                )}
              </Select>
              <Input
                label="Voice Name"
                size="md"
                isRequired
                value={editorContext?.persistSettings?.ttsVoice ?? ""}
                onValueChange={(value) => {
                  updateEditorSettings({
                    settings: {
                      ttsVoice: value,
                    },
                  });
                }}
                isDisabled={!editorContext?.persistSettings?.ttsProvider}
              />
              <Tooltip
                content={
                  <p>
                    Please disable password to edit API Key. <br />
                    You can enable password again after editing API keys.
                  </p>
                }
                isDisabled={!editorContext?.persistSettings?.isUsePassword}
              >
                <Input
                  label="API Key"
                  size="md"
                  isRequired
                  value={editorContext?.persistSettings?.ttsAPIKey ?? ""}
                  onValueChange={(value) => {
                    updateEditorSettings({
                      settings: {
                        ttsAPIKey: value,
                      },
                    });
                  }}
                  isDisabled={!editorContext?.persistSettings?.ttsProvider}
                  isReadOnly={editorContext?.persistSettings?.isUsePassword}
                />
              </Tooltip>
            </div>
          </div>
          <Divider />
          <p className="text-small text-foreground">Security</p>
          <p className="text-small text-foreground">
            This app currently runs in browser environment and has not yet
            implemented a backend or system file APIs using Electronjs or
            Capacitorjs. Therefore, the API tokens are stored in the
            browser&apos;s local storage and can be prone to attacks. Use a
            password to encrypt the API tokens as a temporary workaround.
          </p>
          <Switch
            isSelected={editorContext?.persistSettings?.isUsePassword ?? false}
            onChange={(e) => {
              const newValue = e.target.checked;
              if (newValue) {
                setIsOpen(false);
                updateEditorSettings({
                  settings: {
                    isUsePassword: newValue,
                  },
                });
              } else {
                // Reset all settings
                updateEditorSettings({
                  settings: undefined,
                });
              }
            }}
          >
            Encrypt API tokens with password
          </Switch>
          <p className="text-small text-foreground">
            The API tokens are saved for the duration of the TTL (Time To Live)
            days. After the TTL, the API tokens will be deleted when the app
            opens next time. Set -1 to keep the tokens indefinitely.
          </p>
          <Input
            label="TTL (in days)"
            size="md"
            isRequired
            defaultValue="14"
            value={ttl}
            onValueChange={(value) => {
              setTTL(value);

              let days = 14;

              days = parseInt(value);

              // Reset to default if invalid
              if (days < -1) {
                days = 14;
              } else if (Number.isNaN(days)) {
                days = 14;
                toast.error("Invalid input. Using default 14 days.");
              }

              updateEditorSettings({
                settings: {
                  ttl: days === -1 ? -1 : days * 86400000,
                },
              });
            }}
          />
        </div>
      </>
    </ModalWrapper>
  );
}
