
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
    return;
}


// let tray

// function createTray() {
//     const icon = nativeImage.createFromPath('icon.png')
//     tray = new Tray(icon)

//     const contextMenu = Menu.buildFromTemplate([
//         { label: 'Item1', type: 'radio' },
//         { label: 'Item2', type: 'radio' },
//         { label: 'Item3', type: 'radio', checked: true },
//         { label: 'Item4', type: 'radio' }
//     ])

//     tray.setContextMenu(contextMenu)

//     tray.setToolTip('This is my application')
//     tray.setTitle('This is my title')
// }

// fetchOrCreateConfig();

// app.whenReady().then(createTray)

function createWindow(file) {
    const win = new BrowserWindow({
        width: 640,
        height: 360,
        resizable: false,
    })
    win.removeMenu();
    win.webContents.setWindowOpenHandler(openExternalAndDeny);
    win.loadFile(file)
}


function openExternalAndDeny({ url }) {
    shell.openExternal(url);
    return { action: 'deny' };
}
