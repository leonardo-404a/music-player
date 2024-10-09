import fs from "fs";
import path, { join } from "path";
const { app, BrowserWindow, ipcMain, session, dialog } = require("electron");
import Store from "electron-store";

const store = new Store();

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        // frame: false, todo: ver depois para personalizar
        webPreferences: {
            preload: join(__dirname, "preload.js"),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    mainWindow.setMenuBarVisibility(false);

    if (process.env.NODE_ENV === "development") {
        const rendererPort = process.argv[2];
        //mainWindow.webContents.openDevTools();
        mainWindow.loadURL(`http://localhost:${rendererPort}`);
    } else {
        mainWindow.loadFile(join(app.getAppPath(), "renderer", "index.html"));
    }
}

ipcMain.handle("dialog:selectFolder", async () => {
    const result = await dialog.showOpenDialog({
        properties: ["openDirectory"],
    });
    return result;
});

ipcMain.handle("select-folder", async () => {
    const result = await dialog.showOpenDialog({
        properties: ["openDirectory"],
    });
    return result;
});

ipcMain.handle("get-selected-folder", async () => {
    return JSON.parse(store.get("musicFolders") as string);
});

ipcMain.handle("read-file-as-data-url", async (_, filePath: string) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.error(`Erro ao ler o arquivo ${filePath}:`, err);
                reject(err);
            } else {
                const base64 = data.toString("base64");
                const mimeType = "audio/mpeg";
                const dataURL = `data:${mimeType};base64,${base64}`;
                resolve(dataURL);
            }
        });
    });
});

ipcMain.handle("update-selected-folder", async (_, folders) => {
    store.set("musicFolders", JSON.stringify(folders));
});

ipcMain.handle("deep-search-music-files", async (event, folders: string[]) => {
    const mp3Files: string[] = [];
    const searchPromises: Promise<void>[] = [];

    async function searchFolder(folder: string) {
        try {
            fs.readdir(folder, { withFileTypes: true, recursive: true }, (err, files) => {
                if (err) throw err;

                files.forEach(async (file) => {
                    searchPromises.push(
                        (async () => {
                            const fullPath = path.join(file.parentPath, file.name);
                            if (file.isFile() && path.extname(file.name).toLowerCase() === ".mp3") {
                                mp3Files.push(fullPath);
                            }
                        })()
                    );
                });
            });
        } catch (err) {
            console.error(`Erro ao ler a pasta ${folder}:`, err);
            return;
        }
    }

    for (const folder of folders) {
        searchPromises.push(searchFolder(folder));
    }

    await Promise.all(searchPromises);

    return mp3Files;
});

app.whenReady().then(() => {
    createWindow();

    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                "Content-Security-Policy": ["script-src 'self'"],
            },
        });
    });

    app.on("activate", function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", function () {
    if (process.platform !== "darwin") app.quit();
});

ipcMain.on("message", (event, message) => {
    console.log(message);
});
