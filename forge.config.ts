import type { ForgeConfig } from "@electron-forge/shared-types";
import path from "path";
import fs from "fs-extra";

function moveModule(moduleList: string[], resourcePath: string) {
  moduleList.forEach((module) => {
    fs.moveSync(
      path.join(resourcePath, module),
      path.join(resourcePath, "app/node_modules", module),
    );
  });
}

const electronModules = ["electron-serve"];

const config: ForgeConfig = {
  outDir: "out-desktop",
  packagerConfig: {
    icon: path.join(__dirname, "/public/icons/electron/pulse_logo_round"),
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
    extraResource: electronModules.map((module) => `node_modules/${module}`),
    afterComplete: [
      (extractPath, electronVersion, platform, arch, done) => {
        // We need electron-serve to exist inside the electron build's node_modules.
        // All other modules from nextjs are not needed and can be removed.
        if (platform === "win32") {
          moveModule(
            electronModules,
            path.join(extractPath, "resources"),
          )
        } else if (platform === "darwin") {
          moveModule(
            electronModules,
            path.join(extractPath, "pulse-editor.app/Contents/Resources"),
          )
        } else if (platform === "linux") {
          moveModule(
            electronModules,
            path.join(extractPath, "resources"),
          )
        }

        done();
      },
    ],
  },
  makers: [
    {
      name: "@electron-forge/maker-deb",
      config: {
        options: {
          icon: "/public/icons/electron/pulse-logo",
        },
      },
    },
  ],
};

export default config;
