
import * as path from 'path';

import * as electron from 'electron'


const __dirname = import.meta.dirname;
const preloadPath = path.join(__dirname, 'preload.js');


export function create(file, width, height, loadData) {
    const win = new electron.BrowserWindow({
        width: width,
        height: height,
        webPreferences: {
            preload: preloadPath,
        },
        resizable: false,
    });
    win.removeMenu();
    win.webContents.setWindowOpenHandler(openExternalAndDeny);
    win.loadFile(file);
    if (loadData) {
        win.webContents.once('did-finish-load', () => {
            win.webContents.send('load', loadData);
        });
    }
}


function openExternalAndDeny({ url }) {
    electron.shell.openExternal(url);
    return { action: 'deny' };
}
