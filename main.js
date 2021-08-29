const { app, BrowserWindow, globalShortcut, Menu, Tray, ipcMain, screen, dialog, clipboard, webContents, protocol } = require('electron') //import app and browser window modules of electron package to be able to manage app lifecycle events, and create and control browser windows
const path = require('path') //import the path package which provides utility functions for the file paths

const fs = require('fs');

const sanitizeHtml = require('sanitize-html');

//const { systemPreferences } = require('electron')
// Prompt to access System Preferences by setting the prompt "true"

//const isTrusted = systemPreferences.isTrustedAccessibilityClient(true)
//console.log("Does the client have accessibility permissions?", isTrusted)


/*** TOOLBAR MENU ICON****** */

//const activeWindow = require('active-win');
let tray = null
var mainWindow
function menuApp() {
    tray = new Tray('rts-icon2.png')
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Save New Version', click() { saveNewVersionWindow() } },
        { label: 'Get the Window', click() { sendTheWindow() } }, //getthewindow = get the active window
        { label: 'Save HTML File', click() { saveActiveWindow() } },
        { label: 'Breathe Big', click() { openBreatheBigWindow() } },
    ])
    tray.setToolTip('This is my application.')
    tray.setContextMenu(contextMenu)
}


//prevent electron from opening a second instance of the app (for example, as a result of the protocol being called on windows)
let newVersionWindow = null
let basicWindow = null

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (newVersionWindow) {
            if (basicWindow) {
                basicWindow.hide()
            }
            if (newVersionWindow.isMinimized()) newVersionWindow.restore()
            newVersionWindow.focus()
        } else {
            if (basicWindow) {
                basicWindow.show()
            }

        }
    })
}
/****#OPEN BASIC (Mini) WINDOW******** */

function openBasicWindow() {
    var theDisplay = screen.getPrimaryDisplay()
    var screenWidth = theDisplay.bounds.width
    basicWindow = new BrowserWindow({
        width: 40,
        height: 52,
        icon: 'rts-icon2.png',
        x: screenWidth - 47,
        y: 25,
        alwaysOnTop: true,
        transparent: true,
        hasShadow: false,
        maximizable: false,
        webPreferences: {
            nodeIntegration: true,  //set to false by default for security reasons. TO access node.js API (eg, use require(...)) in a renderer, this has to be set to true
            contextIsolation: false, //set to true by default. False if want to use node api in renderer process,
        }
    })

    basicWindow.loadURL('file://' + __dirname + '/views/basic-window.html');
    basicWindow.hide()
}


/* **** #OPEN MAIN WINDOW********/

async function saveNewVersionWindow(windowTitle) {
    var theDisplay = screen.getPrimaryDisplay()
    var screenWidth = theDisplay.bounds.width
    newVersionWindow = new BrowserWindow({
        width: 222, //320,
        height: 620,
        x: screenWidth - 209,
        icon: 'file://' + __dirname + '/rts-icon2.png',
        y: 0,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true,  //set to false by default for security reasons. TO access node.js API (eg, use require(...)) in a renderer, this has to be set to true
            contextIsolation: false, //set to true by default. False if want to use node api in renderer process,
            enableRemoteModule: true
        }
    })

    newVersionWindow.loadURL('file://' + __dirname + '/views/main-window.html');
    // newVersionWindow.loadURL('/Users/sean/Desktop/txt-docs/converttest-test.txt')

    //newVersionWindow.openDevTools()
    /*
    newVersionWindow.webContents.on('did-finish-load', function () {
        newVersionWindow.show();
    })
    */
}
/********************************************************* */


/************NEED GIT WINDOW ********************* */
ipcMain.on('open-get-git-window', () => {
    getGitWindow()
})

async function getGitWindow(windowTitle) {
    var getGitWindow
    getGitWindow = new BrowserWindow({
        title: 'Check for Git',
        width: 1000,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, //set to true by default. False if want to use node api in renderer process,

        }
    })

    getGitWindow.loadURL('file://' + __dirname + '/views/get-git-window.html');
}

/******* OPEN NEW WINDOW TO VIEW COMPARISONS ********/

ipcMain.on('open-compare-versions-window', (event, arg1, arg2, arg3, arg4) => {
    compareVersionsWindowFunction(arg1, arg2, arg3, arg4)
})

async function compareVersionsWindowFunction(projectPath, laterVersionInfo, earlierVersionInfo, comparisonType) {
    oldVersionWindow = new BrowserWindow({
        width: 700,
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



/*****## OPEN DIALOG TO SELECT FOLDER ******/

ipcMain.on('open-folder-dialog', (event, arg) => {
    showDialog()
})

function showDialog() {
    //let interval = setInterval(() => { /* nothing */ }, 100)
    dialog.showOpenDialog(newVersionWindow, {
        properties: ['openDirectory'],
        title: "Select Your Project Folder",
        buttonLabel: "Select",
    }).then(result => {
        // clearInterval(interval)
        if (!result.canceled) {
            newVersionWindow.webContents.send('selected-folder', result.filePaths)
        }
    }).catch(err => {
        console.log(err)
    })

    /*
        try {
            dialog.showOpenDialogSync(newVersionWindow, {
                properties: ['openDirectory'],
                title: "Select Your Project Folder",
                buttonLabel: "Select",
            })
        } catch(e){
            console.log('error in opening dialog = ' + e)
        }
        */
}

var breatheWindow
/***BREATHE BIG WINDOW */
function openBreatheBigWindow() {
    var theDisplay = screen.getPrimaryDisplay()
    var size = theDisplay.workAreaSize
    var rightHeight = Math.floor((size.height)) - Math.floor((size.height) - 2)
    //var rightHeight = Math.floor((size.height)-170)
    var xSpot = Math.floor((size.width) / 2) - 112
      breatheWindow = new BrowserWindow({
        show: false,
        height: 165,
        width: 225,
        x: xSpot,
        y: rightHeight,
        title: "Focus",
        hasShadow: false,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true, 
            contextIsolation: false, 
            enableRemoteModule: true
        }
        //backgroundColor: 'white'
    })

    breatheWindow.loadURL('file://' + __dirname + '/views/breathe-big-button.html');

    //focusWindow.webContents.on('did-finish-load', function() {
    breatheWindow.once('ready-to-show', function () {
        //focusWindow.webContents.send('focusText', arg);
        breatheWindow.showInactive();
    });

}

ipcMain.on('close-breathe-window', function () {
    breatheWindow.destroy()
});



/***END BREATHE BIG WINDOW*** */
ipcMain.on('open-main-window', (event, arg) => {
    newVersionWindow.show()
    basicWindow.hide()
})

ipcMain.on('hide-main-window', (event, arg) => {
    basicWindow.show()
    newVersionWindow.hide()
})

/*******GET CONTENT FROM Clipboard For Paste FILE */

ipcMain.on('create-paste-file', (event, divId, folderPath, newDocPath, updatedFileName, newIndent) => {
    var content1 = clipboard.readHTML()
    var cleanContent = sanitizeHtml(content1);
    fs.writeFile(newDocPath, cleanContent, (err, result) => {
        if (err) {
            console.log(err)
            alert('Sorry, there was an error creating this paste file. Please try again.')
        } else {
            newVersionWindow.webContents.send('finished-paste-file', divId, folderPath, newDocPath, updatedFileName, newIndent)
        }
    })
})


/******OPEN HTML FILES *********** */
ipcMain.on('open-html-window', (event, arg1) => {
    var filePath = arg1
    openHTMLWindow(filePath)
})

var htmlWindow
ipcMain.on("toMain", (event, arg) => {
    fs.readFile(arg, 'utf8', (error, data) => {
        var cleanData = sanitizeHtml(data);
        htmlWindow.webContents.send("fromMain", cleanData);
    });
});

function openHTMLWindow(thePath) {
    var filePath = thePath
    //in the case of viewing an old version of an html file, the path will include the worktree, like: [randomnumber]worktree3a7c1e4g7/
    //want to remove that worktree reference, bc otherwise will be confusing to user
    var fullPathName = path.dirname(filePath)
    if (filePath.includes('worktree3a7c1e4g7/')) {
        var fpArray1 = filePath.split('worktree3a7c1e4g7/') //array now has [].../randomNumber, /filename]. Next, get rid of the random number
        var firstPart = fpArray1[0]
        var cleanedFirstPart = firstPart.substring(0, firstPart.lastIndexOf("/") + 1) //this would be fpArray1 without the random number on the end. Bc it's removed everything after the last "/"
        var secondPart = fpArray1[1]
        var pathToUse = cleanedFirstPart + secondPart
        var parentDirectoryName = path.dirname(pathToUse).split(path.sep).pop()
        var relevantPath = (pathToUse.split(parentDirectoryName)[1]).replace('.html', '')
    } else {
        var pathToUse = fullPathName
        var parentDirectoryName = path.dirname(pathToUse).split(path.sep).pop()
        var relevantPath = (filePath.split(parentDirectoryName)[1]).replace('.html', '')
    }

    //goal with fileTitle: should be the main directory/any-subdirectories/file-name
    var fileTitle = parentDirectoryName + relevantPath
    var windowArray = BrowserWindow.getAllWindows()
    var openTheFile = true

    //THIS IS WHY I NEED THE FILE NAME TO HAVE THE PATH directories IN IT: check each opened app window to see if a window with that dirName/fileName is opened. If there is a window with that dirName/fileName already opened, then don't open a new window. Rather, show that window (bring it to foreground/unminimize it)  
    for (var i = 0; i < windowArray.length; i++) {
        let thisWindowTitle = windowArray[i].getTitle()
        if (fileTitle === thisWindowTitle) {
            openTheFile = false
            windowArray[i].show()
        }
    }
    //if a file with that fileTitle is not opened yet:
    if (openTheFile === true) {
        htmlWindow = new BrowserWindow({
            width: 670, //320,
            height: 650,
            title: fileTitle,
            x: 0,
            y: 0,
            // alwaysOnTop: true,
            webPreferences: {
                preload: path.join(__dirname, './preload.js'), //path.join(app.getAppPath(), 'preload.js'),
                nodeIntegration: false,
                contextIsolation: true,
                enableRemoteModule: false,
                sandbox: true,
            }

        })
        var queryString = '?queryParam870988=' + thePath
        //window.loadURL('file:' + filePath);
        htmlWindow.loadURL('file://' + __dirname + '/views/loaded-html-window.html?${hi}' + queryString);

        //QUERY PARAMS DO NOT WORK FOR CONTENT, BECAUSE IT INTERPRETS STUFF LIKE SPACES, ADDING IN %22, ETC. HAVE TO FIND ANOTHER WAY
    }

}


/****SAVE FOCUSED HTML WINDOW***** */

function saveActiveWindow() {
    //get the in focus browser window
    var focusedWindow = BrowserWindow.getFocusedWindow()
    focusedWindow.webContents.send('focused-window-to-save', 'save the html')  //sends to javascript attached to the focused window. file = loaded-html-window.js. 
    //if the focused window is not an html file, then nothing happens
    //next step is to only show the top menu save item if an html file is in focus
    //and to add a right click menu, just on the html file (in the loaded-html-window.js), to do the save action (to go along with control+save keyboard shortcut)
}


/********OPEN DISCOURSE WINDOW FOR AUTHENTICATION ***********/

ipcMain.on('open-discourse-auth-window', (event, arg1) => {
    openDiscourseAuthWindow(arg1)
})

function openDiscourseAuthWindow(discourseUrl) {
    var discourseWindow = new BrowserWindow({
        width: 670, //320,
        height: 650,
        title: 'Authorize',
        // x: 0,
        // y: 0,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            // additionalArguments: [thePath, content],
        }
    })
    //window.loadURL('file:' + filePath);
    discourseWindow.loadURL(discourseUrl);
    discourseWindow.webContents.on('will-navigate', function (event, newUrl) {
        discourseWindow.webContents.send('discourse-payload-url', newUrl)
    })
}


/*********VIEW PRIOR VERSION************* */
async function viewOldVersion() {
    newVersionWindow.webContents.send('view-old-version', 'cool')
}

var oldVersionWindow
var oldVersionWindowCreated = false
async function oldVersionWindowFunction(receivedPath, receivedName, versionNumber, date, time, notes) {
    if (oldVersionWindowCreated === true) {
        /**close any existing old version window before opening a new one */
        oldVersionWindow.destroy()
    }

    oldVersionWindow = new BrowserWindow({
        width: 400,
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

    openBasicWindow()
    saveNewVersionWindow()
    menuApp()
    // createWindow()
    app.on('activate', () => {

        if (BrowserWindow.getAllWindows().length === 0) { //create a new browswer window only if app has no visible windows after being activated, such as when launching the app for the first time or relaunching the already running app
            // createWindow()
        }
    })
})


if (process.platform === 'win32') {

    // Register the private URI scheme differently for Windows
    // https://stackoverflow.com/questions/45570589/electron-protocol-handler-not-working-on-windows
    app.setAsDefaultProtocolClient(
        'saturnproto',
        process.execPath,
        [app.getAppPath()]);

} else {
    app.setAsDefaultProtocolClient('saturnproto');
}


app.on('open-url', function (event, data) {
    event.preventDefault();
    //data is the 
    var payload = data.split('redirect?payload=')[1]
    console.log('RECEIVED!!! data = ' + data)
    console.log('*********************')
    console.log('payload = ' + payload)
    newVersionWindow.webContents.send('discourse-payload-url', payload)

});




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


