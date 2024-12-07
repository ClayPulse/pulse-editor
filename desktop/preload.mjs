const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openFilePicker: (isFolder) =>
    ipcRenderer.invoke("open-file-picker", isFolder),
  readFile: (path) => ipcRenderer.invoke("read-file", path),
});
