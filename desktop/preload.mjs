const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  selectPath: () => ipcRenderer.invoke("select-path"),
  listPathProjects: (uri) => ipcRenderer.invoke("list-path-projects", uri),
  discoverProjectContent: (uri) =>
    ipcRenderer.invoke("discover-project-content", uri),

  createProject: (uri) => ipcRenderer.invoke("create-project", uri),
  updateProject: (oldUri, newUri) => ipcRenderer.invoke("update-project", oldUri, newUri),

  createFolder: (uri) => ipcRenderer.invoke("create-folder", uri),
  createFile: (uri) => ipcRenderer.invoke("create-file", uri),

  readFile: (path) => ipcRenderer.invoke("read-file", path),
  writeFile: (data, path) => ipcRenderer.invoke("write-file", data, path),

  loadSettings: () => ipcRenderer.invoke("load-settings"),
  saveSettings: (settings) => ipcRenderer.invoke("save-settings", settings),
});
