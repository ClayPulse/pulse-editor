import {
  Button,
  Divider,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectItem,
  Switch,
} from "@nextui-org/react";
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
import { LLMProviderOption, llmProviderOptions } from "@/lib/llm/options";
import { useEffect, useState } from "react";
import { STTProviderOption, sttProviderOptions } from "@/lib/stt/options";
import { ttsProviderOptions } from "@/lib/tts/options";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import useMenuStatesContext from "@/lib/hooks/use-menu-states-context";

function SettingPopover() {
  const { menuStates, updateMenuStates } = useMenuStatesContext();

  // const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // const togglePasswordVisibility = () =>
  //   setIsPasswordVisible(!isPasswordVisible);

  return (
    <Popover showArrow={true} placement="bottom" backdrop="opaque">
      <PopoverTrigger>
        <Button
          isIconOnly
          className="h-8 w-8 min-w-8 px-1 py-1 text-default-foreground"
        >
          <IconSettings />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="h-[640px] w-80 overflow-y-auto px-1 py-2">
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
                    const settings = menuStates?.settings ?? {};
                    updateMenuStates({
                      settings: {
                        ...settings,
                        sttProvider: e.target.value,
                        sttModel: undefined,
                        sttAPIKey: undefined,
                      },
                    });
                  }}
                  isRequired
                  selectedKeys={
                    menuStates?.settings?.sttProvider
                      ? [menuStates.settings.sttProvider]
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
                  isDisabled={!menuStates?.settings?.sttProvider}
                  items={
                    sttProviderOptions.find(
                      (provider) =>
                        provider.provider === menuStates?.settings?.sttProvider,
                    )?.models ?? []
                  }
                  disabledKeys={
                    sttProviderOptions
                      .find(
                        (provider) =>
                          provider.provider ===
                          menuStates?.settings?.sttProvider,
                      )
                      ?.models.filter((model) => !model.isSupported)
                      .map((model) => model.model) ?? []
                  }
                  label="Model"
                  placeholder="Select a model"
                  isRequired
                  selectedKeys={
                    menuStates?.settings?.sttModel
                      ? [menuStates.settings.sttModel]
                      : []
                  }
                  onChange={(e) => {
                    const settings = menuStates?.settings ?? {};
                    updateMenuStates({
                      settings: {
                        ...settings,
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
                <Input
                  label="API Key"
                  size="md"
                  isRequired
                  value={menuStates?.settings?.sttAPIKey ?? ""}
                  onValueChange={(value) => {
                    const settings = menuStates?.settings ?? {};
                    updateMenuStates({
                      settings: {
                        ...settings,
                        sttAPIKey: value,
                      },
                    });
                  }}
                  isDisabled={!menuStates?.settings?.sttProvider}
                />
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
                    const settings = menuStates?.settings ?? {};
                    updateMenuStates({
                      settings: {
                        ...settings,
                        llmProvider: e.target.value,
                        llmModel: undefined,
                        llmAPIKey: undefined,
                      },
                    });
                  }}
                  isRequired
                  selectedKeys={
                    menuStates?.settings?.llmProvider
                      ? [menuStates.settings.llmProvider]
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
                  isDisabled={!menuStates?.settings?.llmProvider}
                  items={
                    llmProviderOptions.find(
                      (provider) =>
                        provider.provider === menuStates?.settings?.llmProvider,
                    )?.models ?? []
                  }
                  disabledKeys={
                    llmProviderOptions
                      .find(
                        (provider) =>
                          provider.provider ===
                          menuStates?.settings?.llmProvider,
                      )
                      ?.models.filter((model) => !model.isSupported)
                      .map((model) => model.model) ?? []
                  }
                  label="Model"
                  placeholder="Select a model"
                  isRequired
                  onChange={(e) => {
                    const settings = menuStates?.settings ?? {};
                    updateMenuStates({
                      settings: {
                        ...settings,
                        llmModel: e.target.value,
                      },
                    });
                  }}
                  selectedKeys={
                    menuStates?.settings?.llmModel
                      ? [menuStates?.settings?.llmModel]
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
                  label="API Key"
                  size="md"
                  isRequired
                  value={menuStates?.settings?.llmAPIKey ?? ""}
                  onValueChange={(value) => {
                    const settings = menuStates?.settings ?? {};
                    updateMenuStates({
                      settings: {
                        ...settings,
                        llmAPIKey: value,
                      },
                    });
                  }}
                  isDisabled={!menuStates?.settings?.llmProvider}
                />
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
                    const settings = menuStates?.settings ?? {};
                    updateMenuStates({
                      settings: {
                        ...settings,
                        ttsProvider: e.target.value,
                        ttsModel: undefined,
                        ttsAPIKey: undefined,
                      },
                    });
                  }}
                  isRequired
                  selectedKeys={
                    menuStates?.settings?.ttsProvider
                      ? [menuStates?.settings?.ttsProvider]
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
                  isDisabled={!menuStates?.settings?.ttsProvider}
                  items={
                    ttsProviderOptions.find(
                      (provider) =>
                        provider.provider === menuStates?.settings?.ttsProvider,
                    )?.models ?? []
                  }
                  disabledKeys={
                    ttsProviderOptions
                      .find(
                        (provider) =>
                          provider.provider ===
                          menuStates?.settings?.ttsProvider,
                      )
                      ?.models.filter((model) => !model.isSupported)
                      .map((model) => model.model) ?? []
                  }
                  label="Model"
                  placeholder="Select a model"
                  isRequired
                  onChange={(e) => {
                    const settings = menuStates?.settings ?? {};
                    updateMenuStates({
                      settings: {
                        ...settings,
                        ttsModel: e.target.value,
                      },
                    });
                  }}
                  selectedKeys={
                    menuStates?.settings?.ttsModel
                      ? [menuStates?.settings?.ttsModel]
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
                  label="API Key"
                  size="md"
                  isRequired
                  value={menuStates?.settings?.ttsAPIKey ?? ""}
                  onValueChange={(value) => {
                    const settings = menuStates?.settings ?? {};
                    updateMenuStates({
                      settings: {
                        ...settings,
                        ttsAPIKey: value,
                      },
                    });
                  }}
                  isDisabled={!menuStates?.settings?.ttsProvider}
                />
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
              checked={menuStates?.settings?.isUsePassword}
              onChange={() => {
                const newValue = !menuStates?.settings?.isUsePassword;
                const settings = menuStates?.settings ?? {};
                updateMenuStates({
                  settings: {
                    ...settings,
                    isUsePassword: newValue,
                  },
                });
              }}
            >
              Encrypt API tokens with password
            </Switch>
            {/* <Input
              isDisabled={!isUsePassword}
              label="Password"
              variant="bordered"
              placeholder="Enter your password"
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={togglePasswordVisibility}
                  aria-label="toggle password visibility"
                >
                  {isPasswordVisible ? (
                    <EyeSlashFilledIcon className="pointer-events-none text-2xl text-default-400" />
                  ) : (
                    <EyeFilledIcon className="pointer-events-none text-2xl text-default-400" />
                  )}
                </button>
              }
              type={isPasswordVisible ? "text" : "password"}
              className="max-w-xs"
            /> */}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function MenuToolbar() {
  const { menuStates, updateMenuStates } = useMenuStatesContext();

  return (
    <ToolbarLayout>
      <Button
        isIconOnly
        className="h-8 w-8 min-w-8 px-1 py-1 text-default-foreground"
        onClick={() => {
          if (menuStates) {
            updateMenuStates({ isDrawingMode: !menuStates.isDrawingMode });
          }
        }}
        variant={menuStates?.isDrawingMode ? "faded" : "solid"}
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
          if (menuStates) {
            updateMenuStates({ isRecording: !menuStates.isRecording });
          }
        }}
        variant={menuStates?.isRecording ? "faded" : "solid"}
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

      <SettingPopover />
    </ToolbarLayout>
  );
}
