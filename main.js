const { app, BrowserWindow, globalShortcut, Menu, Tray, ipcMain, screen } = require('electron') //import app and browser window modules of electron package to be able to manage app lifecycle events, and create and control browser windows
const path = require('path') //import the path package which provides utility functions for the file paths
const { keyboard, Key } = require("@nut-tree/nut-js")
/*
function createWindow() { 
   const win = new BrowserWindow({ //creates a new browser window
       width: 530,
       height: 690,
        webPreferences: {
           preload: path.join(__dirname, 'preload.js'),
           nodeIntegration: true,  //set to false by default for security reasons. TO access node.js API (eg, use require(...)) in a renderer, this has to be set to true
           contextIsolation: false, //set to true by default. False if want to use node api in renderer process
           enableRemoteModule: true
        }
    })

    win.loadFile('index.html') //and loads index.html into that browser window
}
*/
function saveNewVersionWindow() {
    let display = screen.getPrimaryDisplay();
    let width = display.bounds.width
    let height = display.bounds.height
    var newVersionWindow = new BrowserWindow({
        width: 600,
        height: 300,
        x: width - 605,
        y: 0,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true,  //set to false by default for security reasons. TO access node.js API (eg, use require(...)) in a renderer, this has to be set to true
            contextIsolation: false, //set to true by default. False if want to use node api in renderer process
        }
    })
    newVersionWindow.loadURL('file://' + __dirname + '/views/save-new-version.html');
    /*
    newVersionWindow.webContents.on('did-finish-load', function () {
        newVersionWindow.show();
    })
    */
}


app.whenReady().then(() => { //once app is initialized, call the function to create the new browswer window
    app.allowRendererProcessReuse = false  //to allow nutjs
    menuApp()
   // createWindow()
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
        { label: 'Save New Version', click() { saveNewVersionWindow() } },
        { label: 'View Old Version', click() { viewOldVersion() } },
        { label: 'Revert to Old Version', click() { revertToOldVersion() } },
    ])
    tray.setToolTip('This is my application.')
    tray.setContextMenu(contextMenu)
}


async function viewOldVersion(){
    win.webContents.send('view-old-version', 'cool')
}

async function revertToOldVersion(){
    win.webContents.send('revert-to-old-version', 'cool')
}


/*
async function getWindow(){
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