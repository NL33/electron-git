const { app, BrowserWindow, globalShortcut, Menu, Tray } = require('electron') //import app and browser window modules of electron package to be able to manage app lifecycle events, and create and control browser windows
const path = require('path') //import the path package which provides utility functions for the file paths

const { keyboard, Key, mouse, left, right, up, down, screen, clipboard } = require("@nut-tree/nut-js");
const { domainToUnicode } = require('url');

function createWindow() { 
    const win = new BrowserWindow({ //creates a new browser window
        width: 800,
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

    console.log('ROCKING!')
    const ret = globalShortcut.register('CommandOrControl+I', () => {
        console.log('CommandOrControl+I is pressed again')
        enterKey()
    })

    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) { //create a new browswer window only if app has no visible windows after being activated, such as when launching the app for the first time or relaunching the already running app
            createWindow()
        }
    })
})

async function enterKey(){
   // keyboard.config.autoDelayMs = 50;
    console.log('in enter key 1')
    // this takes in a string and types it out using the Key. method rather than by string
    /*
    const hackFix = async (string) => {
        string.split("").forEach(async (char) => {
            const character = char.toUpperCase()
            await keyboard.type(Key[character])
        });
    }
    */
    
    try {
        await keyboard.type(Key.LeftSuper, Key.C);//copies whatever is highlighted
       // await keyboard.type("calculator"); // 
        console.log('enter key 2')
        //await hackFix("CALCULATOR") // this works

    } catch (e) {
        console.log('enter key error')
        console.log(e)
    }
}

let tray = null
app.whenReady().then(() => {
    tray = new Tray('mountains-icon.jpg')
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Item1', type: 'radio' },
        { label: 'Item2', type: 'radio' },
        { label: 'Item3', type: 'radio', checked: true },
        { label: 'Item4', type: 'radio' }
    ])
    tray.setToolTip('This is my application.')
    tray.setContextMenu(contextMenu)
    tray.on('click', function() {
       enterKey()
    })
})

app.on('window-all-closed', () => { //quit the application when it no longer has any open windows. This is a no-op on MacOS bc of MacOS window management behavior 
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

//for hot reloading (ie, auto-reloading):
try {
    require('electron-reloader')(module)
} catch (_) { }