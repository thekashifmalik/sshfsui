
import * as path from 'path';

import { app, Tray, Menu, nativeImage, BrowserWindow, shell, ipcMain } from 'electron'
import * as commandExists from 'command-exists';

import * as config from './config.js';


app.whenReady().then(main);

const __dirname = import.meta.dirname;
const preloadPath = path.join(__dirname, 'preload.js');


function main() {
    if (!commandExists.sync('ssh')) {
        createWindow('error-ssh.html');
        return;
    }
    if (!commandExists.sync('sshfs')) {
        createWindow('error-sshfs.html');
        return;
    }
    const targets = config.fetchOrCreateEmptyConfig();
    createTray(targets);
    ipcMain.on('add', (event, data) => {
        config.addTarget(data.name, data.url, data.mount);
        createTray(config.fetchOrCreateEmptyConfig());
    });
    app.on('window-all-closed', () => {});
}

function createWindow(file) {
    const win = new BrowserWindow({
        width: 640,
        height: 360,
        webPreferences: {
            preload: preloadPath,
        },
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
                {
                    label: 'Delete',
                    click: () => {
                        config.deleteTarget(target.name);
                        createTray(config.fetchOrCreateEmptyConfig())
                        tray.destroy();
                    },
                },
            ],
        })
    }

    items = items.concat([
        { type: 'separator' },
        {
            label: 'Add',
            click: () => {
                createWindow('renderer/add.html');
                tray.destroy();
            },
        },
        { label: 'Quit', click: app.quit },
    ])
    const contextMenu = Menu.buildFromTemplate(items);
    tray.setContextMenu(contextMenu);
}

function openExternalAndDeny({ url }) {
    shell.openExternal(url);
    return { action: 'deny' };
}
