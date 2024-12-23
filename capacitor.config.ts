import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.pulse.app",
  appName: "Pulse Editor",
  webDir: "out-next",
  android: {
    buildOptions: {
      signingType: "apksigner",
    },
  },
};

export default config;
