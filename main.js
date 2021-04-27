const { app, BrowserWindow, globalShortcut, Menu, Tray, ipcMain } = require('electron') //import app and browser window modules of electron package to be able to manage app lifecycle events, and create and control browser windows
const path = require('path') //import the path package which provides utility functions for the file paths
const { keyboard, Key, getActiveWindow, Window } = require("@nut-tree/nut-js")
const activeWin = require('active-win')

const { domainToUnicode } = require('url');

var win

function createWindow() { 
    win = new BrowserWindow({ //creates a new browser window
        width: 400,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
           nodeIntegration: true,  //set to false by default for security reasons. TO access node.js API (eg, use require(...)) in a renderer, this has toe be set to true
           contextIsolation: false //set to true by default. False if want to use node api in renderer process
        }
    })

    win.loadFile('index.html') //and loads index.html into that browser window
}


app.whenReady().then(() => { //once app is initialized, call the function to create the new browswer window
    app.allowRendererProcessReuse = false  //to allow nutjs
    menuApp()
    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) { //create a new browswer window only if app has no visible windows after being activated, such as when launching the app for the first time or relaunching the already running app
            createWindow()
        }
    })
})

let tray = null
function menuApp() {
    tray = new Tray('mountains-icon.jpg')
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Commit', click() { gitCommands() } },
        { label: 'Revert', click() { newFunction() } },
        { label: 'Show Old Version', type: 'radio', checked: true },
    ])
    tray.setToolTip('This is my application.')
    tray.setContextMenu(contextMenu)
}

async function gitCommands() {
    console.log('active window = ')
    console.log(await activeWin());
}

/*
async function gitCommands(){
    //win.webContents.send('git-commands', 'cool')
    //var foregroundWindow = await getActiveWindow()
    //console.log('window = ' + foregroundWindow)
    await Window.getActiveWindow().then(result => {
        console.log('active win = ' + JSON.stringify(result))
    })
}
*/




app.on('window-all-closed', () => { //quit the application when it no longer has any open windows. This is a no-op on MacOS bc of MacOS window management behavior 
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

//for hot reloading (ie, auto-reloading):
try {
    require('electron-reloader')(module)
} catch (_) { }