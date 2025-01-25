import { AbstractPlatformAPI } from "../platform-api/abstract-platform-api";
import { getAbstractPlatformAPI } from "../platform-api/get-abstract-platform-api";
import { ExtensionConfig } from "../types";

export class ExtensionManager {
  platformApi: AbstractPlatformAPI;

  constructor() {
    this.platformApi = getAbstractPlatformAPI();
  }

  // Extensions
  async listExtensions(): Promise<ExtensionConfig[]> {
    const installationPath = await this.platformApi.getInstallationPath();
    const path = installationPath + "/extensions";

    const extensionFolders = await this.platformApi.listPathContent(path, {
      include: "folders",
      isRecursive: false,
    });

    const promise = extensionFolders.map(async (folder) => {
      const configFile = await this.platformApi.readFile(
        `${path}/${folder.name}/pulse.config.json`,
      );

      const configText = await configFile.text();

      const config = JSON.parse(configText) as ExtensionConfig;

      return {
        ...config,
      };
    });

    return await Promise.all(promise);
  }

  async downloadExtension(uri: string): Promise<void> {
    throw new Error("Not implemented");
  }

  /* Common  */
  async enableExtension(name: string): Promise<void> {
    const settings = await this.platformApi.getPersistentSettings();
    settings.enabledExtensions = settings.enabledExtensions ?? [];

    if (!settings.enabledExtensions.includes(name)) {
      settings.enabledExtensions.push(name);
    }

    await this.platformApi.setPersistentSettings(settings);
  }
  async disableExtension(name: string): Promise<void> {
    const settings = await this.platformApi.getPersistentSettings();
    settings.enabledExtensions = settings.enabledExtensions ?? [];

    if (settings.enabledExtensions.includes(name)) {
      settings.enabledExtensions = settings.enabledExtensions.filter(
        (name) => name !== name,
      );
    }

    await this.platformApi.setPersistentSettings(settings);
  }

  async importLocalExtension(uri: string): Promise<void> {
    const files = await this.platformApi.listPathContent(uri, {
      include: "all",
      isRecursive: true,
    });

    // Read the config file
    const config = files.find((file) => file.name === "pulse.config.json");

    if (!config) {
      throw new Error("Invalid extension: missing pulse.config.json");
    }
    const configFile = await this.platformApi.readFile(config.uri);
    const configText = await configFile.text();
    const extensionConfig = JSON.parse(configText) as ExtensionConfig;

    // Copy the extension to the extensions folder
    const installationPath = await this.platformApi.getInstallationPath();
    const destination = `${installationPath}/extensions/${extensionConfig.name}`;

    const exists = await this.platformApi.hasFile(destination);

    if (exists) {
      throw new Error("Extension already exists");
    }

    await this.platformApi.createFolder(destination);

    const promise = files.map(async (file) => {
      const fileData = await this.platformApi.readFile(file.uri);

      await this.platformApi.writeFile(fileData, `${destination}/${file.name}`);
    });

    await Promise.all(promise);

    // Enable the extension
    await this.enableExtension(extensionConfig.name);
  }

  async loadExtensionToBlobUri(uri: string): Promise<string> {
    const bundle = await this.platformApi.readFile(uri);

    const blob = new Blob([bundle], { type: "application/javascript" });

    return URL.createObjectURL(blob);
  }

  async isExtensionEnabled(extensionName: string): Promise<boolean> {
    const settings = await this.platformApi.getPersistentSettings();
    return settings.enabledExtensions?.includes(extensionName) ?? false;
  }
}
