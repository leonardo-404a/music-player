import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
    sendMessage: (message: string) => ipcRenderer.send("message", message),
});

contextBridge.exposeInMainWorld("electron", {
    openDirectory: () => ipcRenderer.invoke("dialog:openDirectory"),
});

contextBridge.exposeInMainWorld("api", {
    selectDialogFolder: async () => ipcRenderer.invoke("dialog:selectFolder"),
    deepSearchMusicFiles: async (folders: string[]) => await ipcRenderer.invoke("deep-search-music-files", folders),
    selectFolder: () => ipcRenderer.invoke("select-folder"),
    getMP3Files: () => ipcRenderer.invoke("get-mp3-files"),
    getSelectedFolders: () => ipcRenderer.invoke("get-selected-folder"),
    updateSelectedFolders: (folders: string) => ipcRenderer.invoke("update-selected-folder", folders),
    readFileAsDataURL: (filePath) => ipcRenderer.invoke("read-file-as-data-url", filePath),
});
