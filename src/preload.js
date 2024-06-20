const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
    sendAdd: (data) => ipcRenderer.send('add', data),
    onLoad: (handler) => ipcRenderer.on('load', handler),
    sendEdit: (data) => ipcRenderer.send('edit', data),
})
