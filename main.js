const { app, BrowserWindow, globalShortcut, Menu, Tray, ipcMain, screen, dialog, clipboard, webContents } = require('electron') //import app and browser window modules of electron package to be able to manage app lifecycle events, and create and control browser windows
const path = require('path') //import the path package which provides utility functions for the file paths
const { keyboard, Key } = require("@nut-tree/nut-js")
const fs = require('fs');
// Main process of the Electron application
const { systemPreferences } = require('electron')
// Prompt to access System Preferences by setting the prompt "true"
const isTrusted = systemPreferences.isTrustedAccessibilityClient(true)

console.log("Does the client have accessibility permissions?", isTrusted)

//require = require("esm")(module/*, options*/)
//module.exports = require("./main.js")


/*** TOOLBAR MENU ICON****** */
const { getActiveWindow } = require("@nut-tree/nut-js");
let tray = null
var mainWindow
function menuApp() {
    tray = new Tray('mountains-icon.jpg')
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Save New Version', click() { saveNewVersionWindow() } },
        { label: 'Get the Window', click() { sendTheWindow() } }, //getthewindow = get the active window
        { label: 'Revert to Old Version', click() { revertToOldVersion() } },
    ])
    tray.setToolTip('This is my application.')
    tray.setContextMenu(contextMenu)
}

async function getTheWindow() {
    const foregroundWindow = await getActiveWindow()
    const windowTitle = await foregroundWindow.title
    saveNewVersionWindow(windowTitle)
}

/****SAVING INDIVIDUAL FILES. NOT CURRENTY IN USE */
/*
async function sendTheWindow(){  //this is for saving infi
    const foregroundWindow = await getActiveWindow()
    const windowTitle = await foregroundWindow.title
    newVersionWindow.webContents.send('window-title', windowTitle)
}
*/


/* **** #OPEN MAIN WINDOW********/
var newVersionWindow
async function saveNewVersionWindow(windowTitle) {
    let display = screen.getPrimaryDisplay();
    let width = display.bounds.width
    let height = display.bounds.height
    newVersionWindow = new BrowserWindow({
        width: 320,
        height: 620,
        x: 0,
        y: 0,
        // alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true,  //set to false by default for security reasons. TO access node.js API (eg, use require(...)) in a renderer, this has to be set to true
            contextIsolation: false, //set to true by default. False if want to use node api in renderer process,
            enableRemoteModule: true
        }
    })

    newVersionWindow.loadURL('file://' + __dirname + '/views/git-on-word.html');
    // newVersionWindow.loadURL('/Users/sean/Desktop/txt-docs/converttest-test.txt')
    newVersionWindow.openDevTools()
    //sendTheWindow()

    /*
    newVersionWindow.webContents.on('did-finish-load', function () {
        newVersionWindow.show();
    })
    */
    // convertWord()
}


/*****## OPEN DIALOG TO SELECT FOLDER ******/

ipcMain.on('open-folder-dialog', (event, arg) => {
    showDialog()
})

function showDialog() {
    dialog.showOpenDialog(newVersionWindow, {
        properties: ['openDirectory'],
        title: "Select Your Project Folder",
        buttonLabel: "Select",
    }).then(result => {
        if (!result.canceled) {
            newVersionWindow.webContents.send('selected-folder', result.filePaths)
        }
    }).catch(err => {
        console.log(err)
    })
}


async function viewOldVersion() {
    newVersionWindow.webContents.send('view-old-version', 'cool')
}

async function revertToOldVersion() {
    win.webContents.send('revert-to-old-version', 'cool')
}


/*********VIEW PRIOR VERSION************* */
var oldVersionWindow
var oldVersionWindowCreated = false
async function oldVersionWindowFunction(receivedPath, receivedName, versionNumber, date, time, notes) {
    if (oldVersionWindowCreated === true) {
        /**close any existing old version window before opening a new one */
        oldVersionWindow.destroy()
     }

    oldVersionWindow = new BrowserWindow({
        width: 320,
        //height: 620,
        // transparent: true,
        x: 415,
        y: 0,
        webPreferences: {
            additionalArguments: [receivedPath, receivedName, versionNumber, date, time, notes],
            nodeIntegration: true,  //set to false by default for security reasons. TO access node.js API (eg, use require(...)) in a renderer, this has to be set to true
            contextIsolation: false, //set to true by default. False if want to use node api in renderer process,
            enableRemoteModule: true
        }
    })
    oldVersionWindow.on('close', function () {
        oldVersionWindowCreated = false
        newVersionWindow.webContents.send('close-worktree', receivedPath)
    })
    // newVersionWindow.loadURL('/Users/sean/Desktop/txt-docs/converttest-test.txt')
    oldVersionWindowCreated = true
    oldVersionWindow.loadURL('file://' + __dirname + '/views/get-old-version.html')
}


ipcMain.on('open-old-version-window', (event, args) => {
    var receivedInfo = JSON.parse(args)
    oldVersionWindowFunction(receivedInfo[0], receivedInfo[1], receivedInfo[2], receivedInfo[3], receivedInfo[4], receivedInfo[5])
})

/******* OPEN NEW WINDOW TO VIEW COMPARISONS ********/

ipcMain.on('open-compare-versions-window', (event, arg1, arg2, arg3, arg4) =>{
   compareVersionsWindowFunction(arg1, arg2, arg3, arg4)
})

async function compareVersionsWindowFunction(projectPath, laterVersionInfo, earlierVersionInfo, comparisonType) {
    oldVersionWindow = new BrowserWindow({
        width: 600,
        //height: 620,
        // transparent: true,
        x: 415,
        y: 0,
        webPreferences: {
            additionalArguments: [projectPath, laterVersionInfo, earlierVersionInfo, comparisonType],
            nodeIntegration: true,  //set to false by default for security reasons. TO access node.js API (eg, use require(...)) in a renderer, this has to be set to true
            contextIsolation: false, //set to true by default. False if want to use node api in renderer process,
            enableRemoteModule: true
        }
    })
    // newVersionWindow.loadURL('/Users/sean/Desktop/txt-docs/converttest-test.txt')

    oldVersionWindow.loadURL('file://' + __dirname + '/views/compare-versions.html')
}


/****FOLDER WINDOW (NOT CURRENTLY IN USE) ********/

function folderWindowFunction() {
    let display = screen.getPrimaryDisplay();
    let width = display.bounds.width
    let height = display.bounds.height
    folderWindow = new BrowserWindow({
        width: 600,
        height: 300,
        x: width - 5,
        y: 0,
        //alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true,  //set to false by default for security reasons. TO access node.js API (eg, use require(...)) in a renderer, this has to be set to true
            contextIsolation: false, //set to true by default. False if want to use node api in renderer process,
        }
    })
    folderWindow.loadURL('file://' + __dirname + '/views/folder-view.html');
    //newVersionWindow.loadURL('/Users/sean/Desktop/word-convert-test-folder/word-convert-test.txt')
    folderWindow.openDevTools()
    /*
    newVersionWindow.webContents.on('did-finish-load', function () {
        newVersionWindow.show();
    })
    */
    // convertWord()
}



/*******BASIC SETUP**** */

app.whenReady().then(() => { //once app is initialized, call the function to create the new browswer window
    app.allowRendererProcessReuse = false  //to allow nutjs
    menuApp()
    // createWindow()
    app.on('activate', () => {

        if (BrowserWindow.getAllWindows().length === 0) { //create a new browswer window only if app has no visible windows after being activated, such as when launching the app for the first time or relaunching the already running app
            // createWindow()
        }
    })
})

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


