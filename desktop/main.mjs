import { app, BrowserWindow, ipcMain } from "electron";
import serve from "electron-serve";
import { join } from "path";

import { fileURLToPath } from "url";
import path from "path";
import { nativeTheme } from "electron/main";

import fs from "fs";

// Get the file path of the current module
const __filename = fileURLToPath(import.meta.url);

// Get the directory name of the current module
const __dirname = path.dirname(__filename);

const appServe = serve({
  directory: join(process.resourcesPath, "app/out-next"),
});


const createWindow = () => {
  const win = new BrowserWindow({
    width: 960,
    height: 600,
    webPreferences: {
      preload: join(__dirname, "preload.mjs"),
    },
    titleBarOverlay: {
      color: "#00000000",
      symbolColor: "#74b1be",
    },
  });

  if (app.isPackaged) {
    appServe(win).then(() => {
      win.loadURL("app://-");
    });
  } else {
    win.loadURL("http://localhost:3000");
    // appServe(win).then(() => {
    //   console.log(join(process.resourcesPath, "app/out-next"));
    //   win.loadURL("app://-");
    // });
    win.webContents.openDevTools();
    win.webContents.on("did-fail-load", (e, code, desc) => {
      win.webContents.reloadIgnoringCache();
    });
  }
};

function handleSetTitle(event, title) {
  console.log("Setting title:", title);
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  win.setTitle(title);

  return title[0];
}

function handleListFiles(event, path) {
  return new Promise((resolve, reject) => {
    console.log(path);
    fs.readdir(path, (err, files) => {
      if (err) {
        reject(err);
      }
      resolve(files);
    });
  });
}

app.whenReady().then(() => {
  nativeTheme.themeSource = "light";

  ipcMain.handle("list-files", handleListFiles);
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
