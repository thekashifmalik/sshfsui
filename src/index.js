import * as child_process from "child_process";

import fixPath from 'fix-path';
import { app, Tray, Menu, nativeImage, ipcMain } from 'electron'
import commandExists from 'command-exists';

import * as config from './config.js';
import * as window from './window.js';


app.whenReady().then(main);


async function main() {
    fixPath();
    try {
        await commandExists('ssh');
        await commandExists('sshfs');
    } catch {
        await window.create('src/renderer/error.html', 320, 120);
        return
    }
    await createTray();
    ipcMain.on('add', (event, data) => {
        config.addTarget(data.name, data.url, data.mount);
    });
    ipcMain.on('edit', (event, data) => {
        config.deleteTarget(data.initialName);
        config.addTarget(data.target.name, data.target.url, data.target.mount);
    });
    app.on('window-all-closed', createTray);
}

async function createTray() {
    const appPath = app.getAppPath();
    const icon = nativeImage.createFromPath(appPath + '/assets/tray.png');
    const iconDisconnected = nativeImage.createFromPath(appPath + '/assets/disconnected.png');
    const iconConnected = nativeImage.createFromPath(appPath + '/assets/connected.png');
    const tray = new Tray(icon);

    var items = [
        {
            label: 'SSHFS UI',
            enabled: false,
        },
        { type: 'separator' },
    ];

    const targets = config.fetchOrCreateEmptyConfig();
    for (const target of targets) {
        items.push({
            label: target.name,
            submenu: [
                {
                    icon: await target.status() ? iconConnected : iconDisconnected,
                    label: 'Status',
                    enabled: false,
                },
                {
                    label: await target.status() ? 'Disconnect' : 'Connect',
                    click: async () => {
                        const connected = await target.status();
                        if (connected) {
                            await target.disconnect();
                        } else {
                            await target.connect();
                        }
                        await createTray();
                        tray.destroy();
                    },
                },
                {
                    label: 'Open Folder',
                    click: () => {
                        child_process.execSync('open ' + target.mount);
                    },
                },
                {
                    label: 'Edit',
                    enabled: !await target.status(),
                    click: async () => {
                        await window.create('src/renderer/edit.html', 360, 160, target);
                        tray.destroy();
                    },
                },
                {
                    label: 'Delete',
                    click: async () => {
                        config.deleteTarget(target.name);
                        await createTray();
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
            click: async () => {
                await window.create('src/renderer/add.html', 360, 160);
                tray.destroy();
            },
        },
        { label: 'Quit', click: app.quit },
    ])
    const contextMenu = Menu.buildFromTemplate(items);
    tray.setContextMenu(contextMenu);
}
