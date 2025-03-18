const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  selectDir: () => ipcRenderer.invoke("select-dir"),
  selectFile: (fileExtension) =>
    ipcRenderer.invoke("select-file", fileExtension),

  listProjects: (uri) => ipcRenderer.invoke("list-projects", uri),
  listPathContent: (uri, options) =>
    ipcRenderer.invoke("list-path-content", uri, options),

  createProject: (uri) => ipcRenderer.invoke("create-project", uri),
  createFolder: (uri) => ipcRenderer.invoke("create-folder", uri),
  createFile: (uri) => ipcRenderer.invoke("create-file", uri),

  rename: (oldUri, newUri) => ipcRenderer.invoke("rename", oldUri, newUri),
  delete: (uri) => ipcRenderer.invoke("delete", uri),

  hasFile: (path) => ipcRenderer.invoke("has-file", path),
  readFile: (path) => ipcRenderer.invoke("read-file", path),
  writeFile: (data, path) => ipcRenderer.invoke("write-file", data, path),

  copyFiles: (from, to) => ipcRenderer.invoke("copy-files", from, to),

  loadSettings: () => ipcRenderer.invoke("load-settings"),
  saveSettings: (settings) => ipcRenderer.invoke("save-settings", settings),

  getInstallationPath: () => ipcRenderer.invoke("get-installation-path"),

  createTerminal: () => ipcRenderer.invoke("create-terminal"),
});
