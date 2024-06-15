import * as child_process from "child_process";

import fixPath from 'fix-path';
import { app, Tray, Menu, nativeImage, ipcMain } from 'electron'
import * as commandExists from 'command-exists';

import * as config from './config.js';
import * as window from './window.js';


app.whenReady().then(main);


function main() {
    fixPath();
    if (!commandExists.sync('ssh')) {
        window.create('src/error-ssh.html', 640, 360);
        return;
    }
    if (!commandExists.sync('sshfs')) {
        window.create('src/error-sshfs.html', 640, 360);
        return;
    }
    const targets = config.fetchOrCreateEmptyConfig();
    createTray(targets);
    ipcMain.on('add', (event, data) => {
        config.addTarget(data.name, data.url, data.mount);
    });
    app.on('window-all-closed', () => {
        createTray(config.fetchOrCreateEmptyConfig());
    });
}

function createTray(targets) {
    const appPath = app.getAppPath();
    const icon = nativeImage.createFromPath(appPath + '/assets/tray.png');
    const iconDisconnected = nativeImage.createFromPath(appPath + '/assets/disconnected.png');
    const iconConnected = nativeImage.createFromPath(appPath + '/assets/connected.png');
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
                    label: 'Open Folder',
                    click: () => {
                        child_process.execSync('open ' + target.mount);
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
                window.create('src/renderer/add.html', 360, 240);
                tray.destroy();
            },
        },
        { label: 'Quit', click: app.quit },
    ])
    const contextMenu = Menu.buildFromTemplate(items);
    tray.setContextMenu(contextMenu);
}
