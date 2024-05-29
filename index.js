
const { app, Tray, Menu, nativeImage } = require('electron')
const fs = require('fs');

let tray

function createTray() {
    const icon = nativeImage.createFromPath('icon.png')
    tray = new Tray(icon)

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Item1', type: 'radio' },
        { label: 'Item2', type: 'radio' },
        { label: 'Item3', type: 'radio', checked: true },
        { label: 'Item4', type: 'radio' }
    ])

    tray.setContextMenu(contextMenu)

    tray.setToolTip('This is my application')
    tray.setTitle('This is my title')
}

const homedir = require('os').homedir();
const configDir = homedir + '/.sshfsui'

function fetchOrCreateConfig() {
    try {
        fetchConfig()
    } catch (error) {
        createConfig()
    }
}

function fetchConfig() {
    const targets = fs.readdirSync(configDir, { withFileTypes: true })
        .filter(item => !item.isDirectory())
        .map(item => item.name);
    console.log(`found targets: ${targets}`)
}

function createConfig() {
    fs.mkdirSync(configDir)
    console.log(`created ${configDir}`)
}


fetchOrCreateConfig();

app.whenReady().then(createTray)


// const { app, BrowserWindow } = require('electron')

// const createWindow = () => {
//     const win = new BrowserWindow({
//         width: 800,
//         height: 600
//     })

//     win.loadFile('index.html')
// }

// app.whenReady().then(() => {
//     createWindow()
// })
