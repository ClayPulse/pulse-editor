import { app, BrowserWindow, dialog, ipcMain } from "electron";
import serve from "electron-serve";
import path from "path";
import { fileURLToPath } from "url";
import { nativeTheme } from "electron/main";

import fs from "fs";

// Get the file path of the current module
const __filename = fileURLToPath(import.meta.url);

// Get the directory name of the current module
const __dirname = path.dirname(__filename);

const appServe = serve({
  directory: path.join(process.resourcesPath, "next"),
});

const createWindow = () => {
  const win = new BrowserWindow({
    width: 960,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },
    titleBarOverlay: {
      color: "#00000000",
      symbolColor: "#74b1be",
    },
    icon: path.join(__dirname, "../shared/icons/electron/pulse_logo_round"),
  });

  win.menuBarVisible = false;

  // Production launch
  if (app.isPackaged) {
    appServe(win).then(() => {
      win.loadURL("app://-");
    });
  }
  // Development launch
  else {
    win.loadURL("http://localhost:3000");
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

async function handleShowOpenFileDialog(event, config) {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: config?.isFolder ? ["openDirectory"] : ["openFile"],
  });
  if (!canceled) {
    return filePaths;
  }
}

async function handleShowSaveFileDialog(event, config) {
  const { canceled, filePath } = await dialog.showSaveDialog({});
  if (!canceled) {
    return filePath;
  }
  return undefined;
}

async function handleReadFile(event, path) {
  // Read the file at path
  const data = await fs.promises.readFile(path, "utf-8");

  return data;
}

async function handleWriteFile(event, data, path) {
  // Write the data at path
  await fs.promises.writeFile(path, data);
}

app.whenReady().then(() => {
  nativeTheme.themeSource = "light";

  ipcMain.handle("show-open-file-dialog", handleShowOpenFileDialog);
  ipcMain.handle("show-save-file-dialog", handleShowSaveFileDialog);
  ipcMain.handle("read-file", handleReadFile);
  ipcMain.handle("write-file", handleWriteFile);
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
