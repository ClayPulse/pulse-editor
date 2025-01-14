import { AbstractPlatformAPI } from "./abstract-platform-api";
import { PlatformEnum } from "./available-platforms";
import { CapacitorAPI } from "./capacitor/capacitor-api";
import { ElectronAPI } from "./electron/electron-api";
import { getPlatform } from "./platform-checker";
import { WebAPI } from "./web/web-api";

export function getAbstractPlatformAPI(): AbstractPlatformAPI {
  const platform = getPlatform();

  if (platform === PlatformEnum.Capacitor) {
    return new CapacitorAPI();
  } else if (platform === PlatformEnum.Electron) {
    return new ElectronAPI();
  } else if (platform === PlatformEnum.Web) {
    return new WebAPI();
  } else if (platform === PlatformEnum.VSCode) {
    // platformApi.current = new VSCodeAPI();
    throw new Error("VSCode API not implemented");
  } else {
    throw new Error("Unknown platform");
  }
}