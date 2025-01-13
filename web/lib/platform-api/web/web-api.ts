import {
  FileSystemObject,
  OpenFileDialogConfig,
  PersistentSettings,
  ProjectInfo,
} from "@/lib/types";
import { AbstractPlatformAPI } from "../abstract-platform-api";
import toast from "react-hot-toast";

interface StoredValue<T> {
  value: T;
  expiry: number;
}

export class WebAPI extends AbstractPlatformAPI {
  constructor() {
    super();
  }

  async selectPath(): Promise<string | undefined> {
    toast.error("Not implemented");
    throw new Error("Method not implemented.");
  }

  async listPathProjects(uri: string): Promise<ProjectInfo[]> {
    toast.error("Not implemented");
    throw new Error("Method not implemented.");
  }

  async discoverProjectContent(uri: string): Promise<FileSystemObject[]> {
    toast.error("Not implemented");
    throw new Error("Method not implemented.");
  }

  async createProject(uri: string): Promise<void> {
    toast.error("Not implemented");
    throw new Error("Method not implemented.");
  }

  // Reserved for cloud environment implementation
  async readFile(uri: string): Promise<File> {
    throw new Error("Method not implemented.");
  }
  async writeFile(file: File, uri: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  /* Persistent Settings */
  async getPersistentSettings(): Promise<PersistentSettings> {
    // Load settings from local storage
    const loadedSettings: PersistentSettings = {};

    const sttProvider = this.getValue<string>("sttProvider");
    const llmProvider = this.getValue<string>("llmProvider");
    const ttsProvider = this.getValue<string>("ttsProvider");
    const sttModel = this.getValue<string>("sttModel");
    const llmModel = this.getValue<string>("llmModel");
    const ttsModel = this.getValue<string>("ttsModel");
    const isUsePassword = this.getValue<boolean>("isUsePassword");
    const isPasswordSet = this.getValue<boolean>("isPasswordSet");
    const ttl = this.getValue<number>("ttl");
    const ttsVoice = this.getValue<string>("ttsVoice");
    const projectHomePath = this.getValue<string>("projectHomePath");

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
      const sttAPIKey = this.getValue<string>("sttAPIKey");
      const llmAPIKey = this.getValue<string>("llmAPIKey");
      const ttsAPIKey = this.getValue<string>("ttsAPIKey");
      loadedSettings.sttAPIKey = sttAPIKey ?? undefined;
      loadedSettings.llmAPIKey = llmAPIKey ?? undefined;
      loadedSettings.ttsAPIKey = ttsAPIKey ?? undefined;
    }

    return loadedSettings;
  }

  async setPersistentSettings(settings: PersistentSettings) {
    // Default TTL is set to 14 days
    if (!settings.ttl) {
      settings.ttl = 14 * 24 * 60 * 60 * 1000;
    }
    // Save settings to local storage
    this.setValue("sttProvider", settings.sttProvider);
    this.setValue("llmProvider", settings.llmProvider);
    this.setValue("ttsProvider", settings.ttsProvider);
    this.setValue("sttModel", settings.sttModel);
    this.setValue("llmModel", settings.llmModel);
    this.setValue("ttsModel", settings.ttsModel);
    this.setValue("isUsePassword", settings.isUsePassword);
    this.setValue("isPasswordSet", settings.isPasswordSet);
    this.setValue("ttl", settings.ttl); // 14 days
    this.setValue("ttsVoice", settings.ttsVoice);
    this.setValue("projectHomePath", settings.projectHomePath);

    // Do not allow API token editing after password is set
    if (!settings.isPasswordSet) {
      const sttAPIKey = settings.sttAPIKey;
      const llmAPIKey = settings.llmAPIKey;
      const ttsAPIKey = settings.ttsAPIKey;
      this.setValue("sttAPIKey", sttAPIKey, settings.ttl);
      this.setValue("llmAPIKey", llmAPIKey, settings.ttl);
      this.setValue("ttsAPIKey", ttsAPIKey, settings.ttl);
    }
    // Only update TTL if it is set
    else {
      const encryptedSttAPIKey = this.getValue<string>("sttAPIKey");
      const encryptedLlmAPIKey = this.getValue<string>("llmAPIKey");
      const encryptedTtsAPIKey = this.getValue<string>("ttsAPIKey");
      this.setValue("sttAPIKey", encryptedSttAPIKey, settings.ttl);
      this.setValue("llmAPIKey", encryptedLlmAPIKey, settings.ttl);
      this.setValue("ttsAPIKey", encryptedTtsAPIKey, settings.ttl);
    }
  }

  async resetPersistentSettings() {
    // Reset all settings
    this.setValue("sttProvider", undefined);
    this.setValue("llmProvider", undefined);
    this.setValue("ttsProvider", undefined);
    this.setValue("sttModel", undefined);
    this.setValue("llmModel", undefined);
    this.setValue("ttsModel", undefined);
    this.setValue("sttAPIKey", undefined);
    this.setValue("llmAPIKey", undefined);
    this.setValue("ttsAPIKey", undefined);
    this.setValue("isUsePassword", undefined);
    this.setValue("isPasswordSet", undefined);
    this.setValue("ttl", undefined);
    this.setValue("ttsVoice", undefined);
    this.setValue("projectHomePath", undefined);
  }

  private getValue<T>(key: string): T | undefined {
    const itemStr = localStorage.getItem(key);
    if (itemStr) {
      const item: StoredValue<T> = JSON.parse(itemStr);
      const now = new Date();

      // If the expiry is -1, it means the item never expires
      if (item.expiry === -1) {
        return item.value;
      }
      // If the item has expired, remove it and return the initial value
      else if (now.getTime() > item.expiry) {
        localStorage.removeItem(key);
        return undefined;
      }
      return item.value;
    }
    return undefined;
  }

  // Function to save the value with expiry
  private setValue<T>(
    key: string,
    value: T,
    // Set default expiration time to forever
    ttl: number = -1,
  ) {
    // Clear the item if the value is not defined
    if (!value) {
      localStorage.removeItem(key);
      return;
    }

    const now = new Date();
    const time = now.getTime();
    const item: StoredValue<T> = {
      value,
      expiry: ttl === -1 ? -1 : time + ttl,
    };
    localStorage.setItem(key, JSON.stringify(item));
  }
}
