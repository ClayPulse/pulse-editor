import { PlatformEnum } from "../platform-api/available-platforms";
import { getPlatform } from "../platform-api/platform-checker";
import { PersistSettings } from "../types";
import { useLocalStorage } from "./use-local-storage";

export default function usePersistSettings() {
  const { getValue, setValue } = useLocalStorage();
  const platform = getPlatform();

  async function getPersistSettings(): Promise<PersistSettings> {
    // Load settings from local storage
    const loadedSettings: PersistSettings = {};

    const sttProvider = getValue<string>("sttProvider");
    const llmProvider = getValue<string>("llmProvider");
    const ttsProvider = getValue<string>("ttsProvider");
    const sttModel = getValue<string>("sttModel");
    const llmModel = getValue<string>("llmModel");
    const ttsModel = getValue<string>("ttsModel");
    const isUsePassword = getValue<boolean>("isUsePassword");
    const isPasswordSet = getValue<boolean>("isPasswordSet");
    const ttl = getValue<number>("ttl");
    const ttsVoice = getValue<string>("ttsVoice");
    const projectHomePath = getValue<string>("projectHomePath");

    loadedSettings.sttProvider = sttProvider ?? undefined;
    loadedSettings.llmProvider = llmProvider ?? undefined;
    loadedSettings.ttsProvider = ttsProvider ?? undefined;
    loadedSettings.sttModel = sttModel ?? undefined;
    loadedSettings.llmModel = llmModel ?? undefined;
    loadedSettings.ttsModel = ttsModel ?? undefined;
    loadedSettings.isUsePassword = isUsePassword ?? undefined;
    loadedSettings.isPasswordSet = isPasswordSet ?? undefined;
    loadedSettings.ttl = ttl ?? undefined;
    loadedSettings.ttsVoice = ttsVoice ?? undefined;
    loadedSettings.projectHomePath = projectHomePath ?? undefined;

    // Only load API keys here if password is not set.
    // If password is set, API keys will be loaded after password is entered.
    if (!isPasswordSet) {
      const sttAPIKey = getValue<string>("sttAPIKey");
      const llmAPIKey = getValue<string>("llmAPIKey");
      const ttsAPIKey = getValue<string>("ttsAPIKey");
      loadedSettings.sttAPIKey = sttAPIKey ?? undefined;
      loadedSettings.llmAPIKey = llmAPIKey ?? undefined;
      loadedSettings.ttsAPIKey = ttsAPIKey ?? undefined;
    }

    return loadedSettings;
  }

  async function setPersistSettings(settings: PersistSettings) {
    // Default TTL is set to 14 days
    if (!settings.ttl) {
      settings.ttl = 14 * 24 * 60 * 60 * 1000;
    }
    // Save settings to local storage
    setValue("sttProvider", settings.sttProvider);
    setValue("llmProvider", settings.llmProvider);
    setValue("ttsProvider", settings.ttsProvider);
    setValue("sttModel", settings.sttModel);
    setValue("llmModel", settings.llmModel);
    setValue("ttsModel", settings.ttsModel);
    setValue("isUsePassword", settings.isUsePassword);
    setValue("isPasswordSet", settings.isPasswordSet);
    setValue("ttl", settings.ttl); // 14 days
    setValue("ttsVoice", settings.ttsVoice);
    setValue("projectHomePath", settings.projectHomePath);

    // Do not allow API token editing after password is set
    if (!settings.isPasswordSet) {
      const sttAPIKey = settings.sttAPIKey;
      const llmAPIKey = settings.llmAPIKey;
      const ttsAPIKey = settings.ttsAPIKey;
      setValue("sttAPIKey", sttAPIKey, settings.ttl);
      setValue("llmAPIKey", llmAPIKey, settings.ttl);
      setValue("ttsAPIKey", ttsAPIKey, settings.ttl);
    }
    // Only update TTL if it is set
    else {
      const encryptedSttAPIKey = getValue<string>("sttAPIKey");
      const encryptedLlmAPIKey = getValue<string>("llmAPIKey");
      const encryptedTtsAPIKey = getValue<string>("ttsAPIKey");
      setValue("sttAPIKey", encryptedSttAPIKey, settings.ttl);
      setValue("llmAPIKey", encryptedLlmAPIKey, settings.ttl);
      setValue("ttsAPIKey", encryptedTtsAPIKey, settings.ttl);
    }
  }

  async function clearPersistSettings() {
    // Reset all settings
    setValue("sttProvider", undefined);
    setValue("llmProvider", undefined);
    setValue("ttsProvider", undefined);
    setValue("sttModel", undefined);
    setValue("llmModel", undefined);
    setValue("ttsModel", undefined);
    setValue("sttAPIKey", undefined);
    setValue("llmAPIKey", undefined);
    setValue("ttsAPIKey", undefined);
    setValue("isUsePassword", undefined);
    setValue("isPasswordSet", undefined);
    setValue("ttl", undefined);
    setValue("ttsVoice", undefined);
    setValue("projectHomePath", undefined);
  }

  return {
    getPersistSettings,
    setPersistSettings,
    clearPersistSettings,
  };
}
