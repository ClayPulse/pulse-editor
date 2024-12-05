const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  listFiles: (path) => ipcRenderer.invoke("list-files", path),
});
