import { Capacitor } from "@capacitor/core";
import isElectron from "is-electron";
import { PlatformEnum } from "@/lib/types";

export function getPlatform() {
  // Capacitor
  if (Capacitor.isNativePlatform()) {
    return PlatformEnum.Capacitor;
  }
  // Electron
  else if (isElectron()) {
    // VSCode runs on Electron.
    // The extension sets a query parameter to differentiate between the two.
    if (new URLSearchParams(window.location.search).get("vscode") === "true") {
      return PlatformEnum.VSCode;
    }
    return PlatformEnum.Electron;
  }
  
  // If none of the above, it's web
  return PlatformEnum.Web;
}
