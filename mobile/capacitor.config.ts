import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.pulse.app",
  appName: "Pulse Editor",
  webDir: "../build/next",
  android: {
    buildOptions: {
      signingType: "apksigner",
    },
    path: "./android",
  }, 
};

export default config;
