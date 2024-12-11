import type { ForgeConfig } from "@electron-forge/shared-types";
import path from "path";
import fs from "fs-extra";

function removeNextjsModules(exceptionList: string[], nodeModulesPath: string) {
  fs.readdirSync(nodeModulesPath).forEach((module) => {
    if (!exceptionList.includes(module)) {
      fs.removeSync(path.join(nodeModulesPath, module));
    }
  });
}

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
      } else if (path.match(/node_modules/)) {
        return false;
      }
      return true;
    },
    afterComplete: [
      (extractPath, electronVersion, platform, arch, done) => {
        // We need electron-serve to exist inside the electron build's node_modules.
        // All other modules from nextjs are not needed and can be removed.

        const electronModules = ["electron-serve"];
        if (platform === "win32") {
          removeNextjsModules(
            electronModules,
            path.join(extractPath, "resources/app/node_modules"),
          );
        } else if (platform === "darwin") {
          removeNextjsModules(
            electronModules,
            path.join(
              extractPath,
              "chisel-editor.app/Contents/Resources/app/node_modules",
            ),
          );
        } else if (platform === "linux") {
          removeNextjsModules(
            electronModules,
            path.join(extractPath, "resources/app/node_modules"),
          );
        }

        done();
      },
    ],
  },
};

export default config;
