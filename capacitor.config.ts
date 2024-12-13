import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.chisel.app",
  appName: "Chisel Editor",
  webDir: "out-next",
  android: {
    buildOptions: {
      signingType: "apksigner",
    },
  },
};

export default config;
