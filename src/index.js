
import fs from 'fs';
import os from 'os';

import { app, Tray, Menu, nativeImage, BrowserWindow, shell } from 'electron'
import { sync as commandExists } from 'command-exists';

// import { fetchOrCreateConfig } from './config.js';


app.whenReady().then(main);


function main() {
    if (!commandExists('ssh')) {
        createWindow('error-ssh.html');
        return;
    }
    if (!commandExists('sshfs')) {
        createWindow('error-sshfs.html');
        return;
    }
    createTray('icon.png');
}

function createWindow(file) {
    const win = new BrowserWindow({
        width: 640,
        height: 360,
        resizable: false,
    });
    win.removeMenu();
    win.webContents.setWindowOpenHandler(openExternalAndDeny);
    win.loadFile(file);
}

function createTray(file) {
    const icon = nativeImage.createFromPath(file);
    const tray = new Tray(icon);
    const contextMenu = Menu.buildFromTemplate([
        { label: 'SSHFS UI', type: 'normal' },
        { type: 'separator' },
        { label: 'nas-1', submenu: [
            { label: 'Disconnect', type: 'normal' },
        ]},
        // { label: 'Item2', type: 'submenu' },
        { label: 'Item3', type: 'radio', checked: true },
        { label: 'Item4', type: 'checkbox' },
        { type: 'separator' },
        { label: 'Quit', type: 'normal', click: app.quit},
    ]);
    tray.setContextMenu(contextMenu);
}

function openExternalAndDeny({ url }) {
    shell.openExternal(url);
    return { action: 'deny' };
}
