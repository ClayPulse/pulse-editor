import {
  Button,
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
import { PersistentSettings } from "@/lib/types";
import Icon from "../icon";
import useExplorer from "@/lib/hooks/use-explorer";
import { getPlatform } from "@/lib/platform-api/platform-checker";
import { PlatformEnum } from "@/lib/platform-api/available-platforms";

export default function AppSettingsModal({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) {
  const editorContext = useContext(EditorContext);
  const [ttl, setTTL] = useState<string>("14");
  const { selectAndSetProjectHome } = useExplorer();

  function updateEditorSettings({
    settings,
  }: {
    settings: Partial<PersistentSettings> | undefined;
  }) {
    editorContext?.setPersistSettings((prev) => ({
      ...prev,
      ...settings,
    }));
  }

  return (
    <ModalWrapper isOpen={isOpen} setIsOpen={setIsOpen} title={"App Settings"}>
      <>
        <div className="flex w-full flex-col gap-2">
          <div>
            <p className="text-small">Editor Settings</p>
            <div className="w-full space-y-2">
              {editorContext?.persistSettings?.projectHomePath ? (
                <Input
                  label="Project Home Path"
                  size="md"
                  isRequired
                  value={editorContext?.persistSettings?.projectHomePath}
                  onValueChange={(value) => {
                    updateEditorSettings({
                      settings: {
                        projectHomePath: value,
                      },
                    });
                  }}
                  endContent={
                    <Button
                      onPress={() => {
                        selectAndSetProjectHome();
                      }}
                      isIconOnly
                      variant="light"
                    >
                      <Icon name="folder" />
                    </Button>
                  }
                  isDisabled={getPlatform() === PlatformEnum.Capacitor}
                />
              ) : (
                <div className="space-y-1">
                  <p className="text-sm text-content4-foreground">
                    All your projects will be saved in this folder.
                  </p>
                  <Button
                    className="w-full"
                    onPress={() => {
                      selectAndSetProjectHome();
                    }}
                  >
                    Select Project Home Path
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div>
            <p className="text-small">STT</p>
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
                  value={
                    editorContext?.persistSettings?.isPasswordSet
                      ? "API key is encrypted"
                      : (editorContext?.persistSettings?.sttAPIKey ?? "")
                  }
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
            <p className="text-small">LLM</p>
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
                  value={
                    editorContext?.persistSettings?.isPasswordSet
                      ? "API key is encrypted"
                      : (editorContext?.persistSettings?.llmAPIKey ?? "")
                  }
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
            <p className="text-small">TTS</p>
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
                  value={
                    editorContext?.persistSettings?.isPasswordSet
                      ? "API key is encrypted"
                      : (editorContext?.persistSettings?.ttsAPIKey ?? "")
                  }
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
          <p className="text-small">Security</p>
          <p className="text-small">
            Use a password to encrypt the API tokens. You will need to re-enter
            all API tokens if you forget the password.
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
                editorContext?.setPersistSettings(undefined);
                // Remove password from memory
                editorContext?.setEditorStates((prev) => {
                  return {
                    ...prev,
                    password: undefined,
                  };
                });
              }
            }}
          >
            Encrypt API tokens with password
          </Switch>
          <p className="text-small">
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
