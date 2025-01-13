import { app, BrowserWindow, dialog, ipcMain } from "electron";
import serve from "electron-serve";
import path from "path";
import { fileURLToPath } from "url";

import fs from "fs";

// Change path to "Pulse Studio"
app.setName("Pulse Studio");
app.setPath(
  "userData",
  app.getPath("userData").replace("pulse-editor-desktop", "Pulse Studio")
);

// Get the file path of the current module
const __filename = fileURLToPath(import.meta.url);

// Get the directory name of the current module
const __dirname = path.dirname(__filename);

const appServe = serve({
  directory: path.join(process.resourcesPath, "next"),
});

function createWindow() {
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

  ipcMain.on("set-title", handleSetTitle);
}

function handleSetTitle(event, title) {
  console.log("Setting title:", title);
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  win.setTitle(title);
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

async function handleSelectPath(event) {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  if (!canceled) {
    return filePaths[0];
  }
}

// List all folders in a path
async function handleListPathProjects(event, uri) {
  const files = await fs.promises.readdir(uri, { withFileTypes: true });
  const folders = files
    .filter((file) => file.isDirectory())
    .map((file) => file.name)
    .map((projectName) => ({
      name: projectName,
      ctime: fs.statSync(path.join(uri, projectName)).ctime,
    }));

  return folders;
}

async function discoverProjectContent(uri) {
  const files = await fs.promises.readdir(uri, { withFileTypes: true });

  const promise = files.map(async (file) => {
    const name = file.name;
    const absoluteUri = path.join(uri, name);
    if (file.isDirectory()) {
      return {
        name: name,
        isFolder: true,
        subDirItems: await discoverProjectContent(absoluteUri),
        uri: absoluteUri,
      };
    }
    
    return {
      name,
      isFolder: false,
      uri: absoluteUri,
    };
  });

  return Promise.all(promise);
}

// Discover the content of a project
async function handleDiscoverProjectContent(event, uri) {
  return await discoverProjectContent(uri);
}

// Settings
const userDataPath = app.getPath("userData");
const settingsPath = path.join(userDataPath, "settings.json");

function handleSaveSettings(event, settings) {
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
}

function handleLoadSettings(event) {
  if (fs.existsSync(settingsPath)) {
    const data = fs.readFileSync(settingsPath, "utf-8");
    return JSON.parse(data);
  }
  return {};
}

async function handleCreateProject(event, uri) {
  // Create a folder at the uri
  await fs.promises.mkdir(uri);
}

app.whenReady().then(() => {
  ipcMain.handle("read-file", handleReadFile);
  ipcMain.handle("write-file", handleWriteFile);
  ipcMain.handle("select-path", handleSelectPath);
  ipcMain.handle("list-path-projects", handleListPathProjects);
  ipcMain.handle("discover-project-content", handleDiscoverProjectContent);
  ipcMain.handle("load-settings", handleLoadSettings);
  ipcMain.handle("save-settings", handleSaveSettings);
  ipcMain.handle("create-project", handleCreateProject);
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
