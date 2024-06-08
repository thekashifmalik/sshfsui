
import fs from 'fs';
import os from 'os';

import { app, Tray, Menu, nativeImage, BrowserWindow, shell, ipcMain } from 'electron'
import { sync as commandExists } from 'command-exists';

import * as config from './config.js';


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
    const targets = config.fetchOrCreateEmptyConfig();
    createTray(targets);
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

function createTray(targets) {
    const icon = nativeImage.createFromPath('assets/tray.png');
    const iconDisconnected = nativeImage.createFromPath('assets/disconnected.png');
    const iconConnected = nativeImage.createFromPath('assets/connected.png');
    const tray = new Tray(icon);

    var items = [
        { label: 'SSHFS UI', enabled: false },
        { type: 'separator' },
    ];
    for (const target of targets) {
        items.push({
            label: target.name,
            submenu: [
                {
                    icon: target.status() ? iconConnected : iconDisconnected,
                    label: 'Status',
                    enabled: false,
                },
                {
                    label: target.status() ? 'Disconnect' : 'Connect',
                    click: () => {
                        target.status() ? target.disconnect() : target.connect();
                        createTray(targets);
                        tray.destroy();
                    },
                },
            ],
        })
    }

    items = items.concat([
        { label: 'Item3', type: 'radio', checked: true },
        { label: 'Item4', type: 'checkbox' },
        { type: 'separator' },
        { label: 'Quit', type: 'normal', click: app.quit },
    ])
    const contextMenu = Menu.buildFromTemplate(items);
    tray.setContextMenu(contextMenu);
}

function openExternalAndDeny({ url }) {
    shell.openExternal(url);
    return { action: 'deny' };
}
