import type { ForgeConfig } from "@electron-forge/shared-types";

const config: ForgeConfig = {
  outDir: "out-desktop",
  packagerConfig: {
    // Do not package anything but the app/out-next directory
    // using Regular Expressions
    ignore: (path) => {
      if (!path) {
        return false;
      } else if (path.match(/out-next/)) {
        return false;
      } else if (path.match(/package.json/)) {
        return false;
      } else if (path.match(/desktop/)) {
        return false;
      }

      return true;
    },
  },
};

export default config;
