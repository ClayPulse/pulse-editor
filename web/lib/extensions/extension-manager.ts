import { AbstractPlatformAPI } from "../platform-api/abstract-platform-api";
import { getAbstractPlatformAPI } from "../platform-api/get-abstract-platform-api";
import { ExtensionConfig } from "../types";
import JSZip from "jszip";

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

  async uninstallExtension(name: string): Promise<void> {
    const installationPath = await this.platformApi.getInstallationPath();
    const path = `${installationPath}/extensions/${name}`;

    await this.platformApi.delete(path);

    await this.disableExtension(name);
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

    const exists = await this.platformApi.hasPath(destination);

    if (exists) {
      throw new Error("Extension already exists");
    }

    await this.platformApi.copyFiles(uri, destination);

    // Enable the extension
    await this.enableExtension(extensionConfig.name);
  }

  async importLocalExtensionFromZip(zipFile: File): Promise<void> {
    console.log(zipFile);
    const content = await zipFile.arrayBuffer();

    const zipContent = await JSZip.loadAsync(content);

    const files: { name: string; content: string }[] = [];
    // Iterate over the files in the ZIP
    for (const [filename, fileObj] of Object.entries(zipContent.files)) {
      if (!fileObj.dir) {
        // If it's not a directory, extract the file
        const content = await fileObj.async("string"); // Extract as string
        files.push({ name: filename, content });
      }
    }

    // Read the config file
    const config = files.find((file) => file.name === "pulse.config.json");

    if (!config) {
      throw new Error("Invalid extension: missing pulse.config.json");
    }

    const extensionConfig = JSON.parse(config.content) as ExtensionConfig;

    // Copy the extension to the extensions folder
    const installationPath = await this.platformApi.getInstallationPath();
    const destination = `${installationPath}/extensions/${extensionConfig.name}`;

    const exists = await this.platformApi.hasPath(destination);

    if (exists) {
      throw new Error("Extension already exists");
    }

    // Create the extension folder
    await this.platformApi.createFolder(destination);

    // Write the files
    const promises = files.map(async (file) => {
      await this.platformApi.writeFile(
        new File([file.content], file.name),
        `${destination}/${file.name}`,
      );
    });

    await Promise.all(promises);

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
