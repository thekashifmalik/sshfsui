const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
    sendAdd: (data) => ipcRenderer.send('add', data)
})
