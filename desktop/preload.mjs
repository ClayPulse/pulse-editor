const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  showOpenFileDialog: (config) =>
    ipcRenderer.invoke("show-open-file-dialog", config),
  showSaveFileDialog: (config) =>
    ipcRenderer.invoke("show-save-file-dialog", config),
  readFile: (path) => ipcRenderer.invoke("read-file", path),
  writeFile: (data, path) => ipcRenderer.invoke("write-file", data, path),
});
