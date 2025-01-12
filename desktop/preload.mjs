const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  readFile: (path) => ipcRenderer.invoke("read-file", path),
  writeFile: (data, path) => ipcRenderer.invoke("write-file", data, path),
  selectPath: () => ipcRenderer.invoke("select-path"),
  listPathProjects: (uri) => ipcRenderer.invoke("list-path-projects", uri),
  discoverProjectContent: (uri) =>
    ipcRenderer.invoke("discover-project-content", uri),
  loadSettings: () => ipcRenderer.invoke("load-settings"),
  saveSettings: (settings) => ipcRenderer.invoke("save-settings", settings),
  createProject: (uri) => ipcRenderer.invoke("create-project", uri),
});
