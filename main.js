const { app, BrowserWindow, globalShortcut, Menu, Tray, ipcMain, screen, dialog, clipboard, webContents, protocol } = require('electron')
const path = require('path');
const fs = require('fs');
const sanitizeHtml = require('sanitize-html');

const { systemPreferences } = require('electron')
// Prompt to access System Preferences by setting the prompt "true"

const isTrusted = systemPreferences.isTrustedAccessibilityClient(true)
//console.log("Does the client have accessibility permissions?", isTrusted)

let navWindow = null
let projectWindow = null
let basicWindow = null
var projectWindowOpen = false
let tray = null
var hoverWindowInEffect = true /* save preference with local storage*/
var hoverWindow
var welcomeDone = false

function menuApp() {
    try {
        tray = new Tray(__dirname + '/assets/rts-icon2.png')
        const contextMenu = Menu.buildFromTemplate([
            { label: 'Open / Refresh Navigator Window', accelerator: "CmdOrCtrl+1", click() { openNavWindow('update') } },
            { label: 'Toggle Columns', click() { columnChoice() } },
            { label: 'Toggle Chrome Position', click() { chromePosition() } },
            { label: 'Toggle Mouse Right to Open', click() { checkHoverFunction() } },
            { label: 'Close Navigator Window', accelerator: "CmdOrCtrl+2", click() { hideNavWindow() } },
            { type: 'separator' },
            { label: 'Open Project Window', accelerator: "CmdOrCtrl+3", click() { createBasicWindow() } },
            { type: 'separator' },
            { label: 'Minimize Windows', click() { minimizeWindows() } },
            { label: 'Breathe Big', accelerator: "CmdOrCtrl+4", click() { openBreatheBigWindow() } },
            /*  { label: 'Gratitude Notes', accelerator: "CmdOrCtrl+4", click() { openGratitudeNotes() } },*/
        ])
        tray.setToolTip('Be extraordinary.')
        tray.setContextMenu(contextMenu)
    } catch (e) {
        console.log('error in loading tray menu = ' + e)
    }
}
/****Welcome Email Window******** */
ipcMain.on('open-welcome-window', (args, event) => {
    welcomeWindowFunction()
    hideNavWindow()
})

ipcMain.on('already-did-welcome', (args, event) => {
    welcomeDone = true
})
var welcomeWindow = 'n/a'
function welcomeWindowFunction() {
    var appVersion = app.getVersion()
    if ((welcomeWindow === 'n/a') || (welcomeWindow === null) || (welcomeWindow.isDestroyed())) {
        try {
            var appVersion = app.getVersion()
            var theDisplay = screen.getPrimaryDisplay()
            var width = theDisplay.bounds.width
            var height = theDisplay.bounds.height
            welcomeWindow = new BrowserWindow({
                width: 610,
                height: 610,
                // titleBarStyle: 'hidden',
                x: width - 611,
                y: 0,
                // hasShadow: false,
                title: "Welcome",
                webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: false,
                    additionalArguments: [appVersion.toString()],
                    devTools: false
                }
            })
           
            welcomeWindow.loadFile(path.join(__dirname, '/views/email-window.html'));

        } catch (e) {
            console.log('error in creating nav window = ' + e)
        }
    } else {
        welcomeWindow.show()
    }
};

ipcMain.on('welcome-done', (args, event) => {
    welcomeDone = true
    openNavWindow('update')
    welcomeWindow.destroy()
})


/********************Navigator Window ************************/

const createNavWindow = () => {
    try {
        var theDisplay = screen.getPrimaryDisplay()
        var width = theDisplay.bounds.width
        var height = theDisplay.bounds.height
        navWindow = new BrowserWindow({
            width: 610,
            height: height,
            x: width - 611,
            y: 0,
            title: "Navigator",
            /* These options make the window go with the background color: issue: harder to see the apps and text
                 transparency: true,
                 backgroundColor: "#00000000", 
                 vibrancy: "under-window",
          */
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                devTools: false
            }
        })
        navWindow.loadFile(path.join(__dirname, '/views/navigator-window.html'));
        //navWindow.openDevTools() /**********remove-in-production*****/
        navWindow.focus()
        navWindow.on('close', () => {
            navWindow = null
            navLoadingDone = true
        })
    } catch (e) {
        console.log('error in creating nav window = ' + e)
    }
};

function keyBoardShortCut() {
    globalShortcut.register('CommandOrControl+1', () => {
        openNavWindow('update')
    })

    globalShortcut.register('CommandOrControl+2', () => {
        hideNavWindowKeycodeCalled()
    })

    globalShortcut.register('CommandOrControl+3', () => {
        createBasicWindow()
    })

    globalShortcut.register('CommandOrControl+4', () => {
        openBreatheBigWindow()
    })

}

ipcMain.on('open-nav-window', () => {
    openNavWindow('no-update')
})
var okToLoadNavWindow = false
ipcMain.on('nav-loading-complete', () => {
    okToLoadNavWindow = true
})

ipcMain.on('hover-nav-window', (event, target) => {
    openNavWindow('no-update')
})

function openNavWindow(updateOrNot) {
    try {
        if (welcomeDone === true) {
            if (navWindow === null) {
                createNavWindow()
            } else {
                var isVisible = navWindow.isVisible()
                if (isVisible === false) {
                    if (okToLoadNavWindow === true) {
                        if (updateOrNot === 'update'){
                            navWindow.webContents.send('run-loop-function', '')
                        }
                        okToLoadNavWindow = false
                        //don't reload nav function until get message that navloading is complete (so don't reload multiple times while it's loading)
                    }
                    navWindow.show()
                    navWindow.focus()
                    /*navWindow.webContents.send('focus-search', '')*/
                } else {
                    if (okToLoadNavWindow === true) {
                        if (updateOrNot === 'update') {
                            navWindow.webContents.send('run-loop-function', '')
                        }
                        okToLoadNavWindow = false
                        //don't reload nav function until get message that navloading is complete (so don't reload multiple times while it's loading)
                    }
                    navWindow.focus()
                }
            }
            if (projectWindow !== null) {
                if (!projectWindow.isDestroyed()) {
                    projectWindow.minimize() //when call navwindow, assumption is you want that in front. The project Window is always on top. So you need to hide it to see the navwindow
                }
            }
        } else {
            createNavWindow()
        }//end if welcomeDone = true

    } catch (e) {
        console.log('error in opening nav window = ' + e)
    }
}

ipcMain.on('focus-the-window', (event, target) => {
    navWindow.show()
    navWindow.focus()
    /* navWindow.webContents.send('focus-search', '')*/
})

ipcMain.on('minimize-nav-window', (event, target) => {
    hideNavWindow()
})

ipcMain.on('open-nav-window-again', (event, target) => {
    openNavWindow()
})

function hideNavWindow() {
    if (navWindow !== null) {
        navWindow.hide()
    }
    okToLoadNavWindow = true
}

function hideNavWindowKeycodeCalled() {

    if (navWindow !== null) {
        navWindow.hide()

        navWindow.webContents.send('hide-nav-window', '')
        //if keypress called to hide nav window, then want to tell renderer when done, so that it can clear search results. This is not necessary if the renderer itself called the hide nav window, because the renderer already cleared the search results when it did that.
    }
    okToLoadNavWindow = true
}

function columnChoice() {
    navWindow.webContents.send('change-column-preference', '')
}

function chromePosition() {
    navWindow.webContents.send('change-chrome-position', '')
}

function checkHoverFunction() {
    try {
        if (hoverWindowInEffect === false) {
            openHoverWindow()
        } else {
            hoverWindow.destroy()
            hoverWindowInEffect = false
            /*Save preference with local storage */
        }
    } catch (e) {
        console.log('error in trying to change hover preference = ' + e)
    }
}

function openHoverWindow() {
    var theDisplay = screen.getPrimaryDisplay()
    var screenWidth = theDisplay.bounds.width
    var screenHeight = theDisplay.bounds.height
    hoverWindow = new BrowserWindow({
        width: 1,
        height: screenHeight - 1,
        x: screenWidth - 1,
        y: 3,
        alwaysOnTop: true,
        transparent: true,
        hasShadow: false,
        maximizable: false,
        webPreferences: {
            nodeIntegration: true,  //set to false by default for security reasons. TO access node.js API (eg, use require(...)) in a renderer, this has to be set to true
            contextIsolation: false, //set to true by default. False if want to use node api in renderer process,
            devTools: false
        }
    })

    hoverWindow.loadURL('file://' + __dirname + '/views/hover-window.html');
    hoverWindowInEffect = true
    // hoverWindow.openDevTools()
    //hoverWindow.hide()
}

/****Navigator Window: Right Click Menu ***************/

ipcMain.on('show-context-menu-window-name', (event, target) => {
    const template = [
        {
            label: 'Close Window',
            click: () => { event.sender.send('close-window-name', target) }
        }
    ]
    const menu = Menu.buildFromTemplate(template)
    menu.popup(BrowserWindow.fromWebContents(event.sender))
})

ipcMain.on('show-context-menu-chrome-tab', (event, target) => {
    const template = [
        {
            label: 'Close Tab',
            click: () => { event.sender.send('close-tab', target) }
        }
    ]
    const menu = Menu.buildFromTemplate(template)
    menu.popup(BrowserWindow.fromWebContents(event.sender))
})


/*********************Project Window *********************** */

/****#OPEN BASIC (Mini) WINDOW******** */
function createBasicWindow() { //this is the function that opens the project window (and calls for opening the basic window if it is not done yet)
    try {
        // if (projectWindowOpen === false) {
        if ((!projectWindow) || (projectWindow.isDestroyed())) {
            createProjectWindow()
            hideNavWindow()
        } else {
            projectWindow.show()
            hideNavWindow()
            if (basicWindow) {
                // basicWindow.hide()
            }
        }
        if (basicWindow.isDestroyed()) {
            openBasicWindow()
        }
        //  }

    } catch (e) {
        console.log('error in opening project window = ' + e)
    }
}

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
            nodeIntegration: true,
            contextIsolation: false,
            devTools: false
        }
    })

    basicWindow.loadURL('file://' + __dirname + '/views/basic-window.html');
    basicWindow.hide()
}

/* **************** #OPEN PROJECT WINDOW (AKA Main Window)********/

async function createProjectWindow(windowTitle) {
    var theDisplay = screen.getPrimaryDisplay()
    var screenWidth = theDisplay.bounds.width
    // var width = theDisplay.bounds.width
    var height = theDisplay.bounds.height
    projectWindow = new BrowserWindow({
        width: 400, //320,
        height: height,
        x: screenWidth - 405,
        icon: 'file://' + __dirname + '/rts-icon2.png',
        y: 0,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: false
        }
    })

    projectWindow.loadURL('file://' + __dirname + '/views/main-window.html');
    projectWindowOpen = true
    openBasicWindow()
    projectWindow.on('close', () => {
        projectWindowOpen = false
    })

    // projectWindow.openDevTools()
    /*
    projectWindow.webContents.on('did-finish-load', function () {
        projectWindow.show();
    })
    */
}

/*******Project Window: Right Click Menu */

ipcMain.on('show-context-menu-projwindow-directory', (event, divId, thePath, indent, notProject) => {
    const template = [
        {
            label: "New Folder",
            click: () => {
                event.sender.send('enter-new-folder', divId, thePath, indent)
            }
        },
        {
            label: "New File",
            click: () => {
                event.sender.send('enter-new-file', divId, thePath, indent)
            }
        },
        {
            type: "separator"
        },
        {
            label: "View Folder",
            click: () => {
                event.sender.send('view-folder', thePath)
            }
        },
        {
            label: "Refresh",
            click: () => {
                event.sender.send('refresh', '')
            }
        }
    ]
    if (notProject === 'true') {
        template.push(
            {
                type: "separator"
            },
            {
                label: "Move to Trash",
                click: () => {
                    event.sender.send('delete-item', divId)
                }
            }
        )
    }
    const menu = Menu.buildFromTemplate(template)
    menu.popup(BrowserWindow.fromWebContents(event.sender))
})

ipcMain.on('show-context-menu-projwindow-doc', (event, divId) => {
    const template = [
        {
            label: "Move to Trash",
            click: () => {
                event.sender.send('delete-item', divId)
            }
        }
    ]
    const menu = Menu.buildFromTemplate(template)
    menu.popup(BrowserWindow.fromWebContents(event.sender))
})



/*********Prior Versions Overview Window************* */
ipcMain.on('open-prior-version-overview', (event, projectFolderPath, projectFolderName) => {
    priorVersionOverviewWindowFunction(projectFolderPath, projectFolderName)
})

var priorVersionOvWindowShowing = false
var priorVersionOvWindow
function priorVersionOverviewWindowFunction(projectFolderPath, projectFolderName) {
    if (priorVersionOvWindowShowing === true) {
        priorVersionOvWindow.restore()
        priorVersionOvWindow.focus()
    } else {
        priorVersionOvWindow = new BrowserWindow({
            //width: 400,
            //height: 620,
            // transparent: true,
            // x: 415,
            //y: 0,
            webPreferences: {
                additionalArguments: [projectFolderPath, projectFolderName],
                nodeIntegration: true,
                contextIsolation: false,
                devTools: false
                // enableRemoteModule: true
            }
        })
        priorWindowPath = projectFolderPath
        priorVersionOvWindow.loadURL('file://' + __dirname + '/views/prior-versions-overview.html');

        priorVersionOvWindowShowing = true

        priorVersionOvWindow.on('close', function () {
            priorVersionOvWindowShowing = false
            //NOTE: a worktree is created NOT by the priorVersionOvWindow, but by the oldVersionWindow--the window where the actual files of the old window are shown. When that window is closed, it sends a close-worktree call to the main-window. It is not necessary to send that call for this window 
        })
    }
}

/*******************Prior Version Window With Prior Version Contents************** */
async function viewOldVersion() {
    projectWindow.webContents.send('view-old-version', 'cool')
}

var oldVersionWindow
var oldVersionWindowCreated = false
async function oldVersionWindowFunction(receivedPath, receivedName, versionNumber, date, time, notes) {
    if (oldVersionWindowCreated === true) {
        /**close any existing old version window before opening a new one */
        oldVersionWindow.close()
    }

    oldVersionWindow = new BrowserWindow({
        // width: 400,
        //height: 620,
        //transparent: true,
        //x: 415,
        //frame: false,
        webPreferences: {
            additionalArguments: [receivedPath, receivedName, versionNumber, date, time, notes],
            nodeIntegration: true,  //set to false by default for security reasons. TO access node.js API (eg, use require(...)) in a renderer, this has to be set to true
            contextIsolation: false, //set to true by default. False if want to use node api in renderer process,
            //enableRemoteModule: true
            devTools: false
        }
    })
    oldVersionWindow.on('close', function () {
        oldVersionWindowCreated = false
        projectWindow.webContents.send('close-worktree', receivedPath)
    })
    // projectWindow.loadURL('/Users/sean/Desktop/txt-docs/converttest-test.txt')
    oldVersionWindowCreated = true
    oldVersionWindow.loadURL('file://' + __dirname + '/views/get-old-version.html')
    priorVersionOvWindow.close()
}


ipcMain.on('open-old-version-window', (event, args) => {
    var receivedInfo = JSON.parse(args)
    oldVersionWindowFunction(receivedInfo[0], receivedInfo[1], receivedInfo[2], receivedInfo[3], receivedInfo[4], receivedInfo[5])
})

/******* OPEN NEW WINDOW TO VIEW COMPARISONS ********/

ipcMain.on('open-compare-versions-window', (event, arg1, arg2, arg3, arg4) => {
    compareVersionsWindowFunction(arg1, arg2, arg3, arg4)
})

async function compareVersionsWindowFunction(projectPath, laterVersionInfo, earlierVersionInfo, comparisonType) {
    oldVersionWindow = new BrowserWindow({
        //width: 700,
        //height: 620,
        // transparent: true,
        //x: 415,
        // y: 0,
        webPreferences: {
            additionalArguments: [projectPath, laterVersionInfo, earlierVersionInfo, comparisonType],
            nodeIntegration: true,  //set to false by default for security reasons. TO access node.js API (eg, use require(...)) in a renderer, this has to be set to true
            contextIsolation: false, //set to true by default. False if want to use node api in renderer process,
            //  enableRemoteModule: true
            devTools: false
        }
    })
    // projectWindow.loadURL('/Users/sean/Desktop/txt-docs/converttest-test.txt')

    oldVersionWindow.loadURL('file://' + __dirname + '/views/compare-versions.html')
    priorVersionOvWindow.close()
}

/*****## OPEN DIALOG TO SELECT FOLDER ******/

ipcMain.on('open-folder-dialog', (event, arg) => {
    showDialog()
})

function showDialog() {
    //let interval = setInterval(() => { /* nothing */ }, 100)
    dialog.showOpenDialog(projectWindow, {
        properties: ['openDirectory'],
        title: "Select Your Project Folder",
        buttonLabel: "Select",
    }).then(result => {
        // clearInterval(interval)
        if (!result.canceled) {
            projectWindow.webContents.send('selected-folder', result.filePaths)
        }
    }).catch(err => {
        console.log('error in opening dialog = ' + err)
    })

    /*
        try {
            dialog.showOpenDialogSync(projectWindow, {
                properties: ['openDirectory'],
                title: "Select Your Project Folder",
                buttonLabel: "Select",
            })
        } catch(e){
            console.log('error in opening dialog = ' + e)
        }
        */
}


/****MINIMIZE WINDOWS Menu function *****/
function minimizeWindows() {
    navWindow.webContents.send('minimize-windows', '')
    /*
    try {
        const result = await runJxa(`
            const evalAS2 = s => {
                    const a = Application.currentApplication();
                    const sa = (a.includeStandardAdditions = true, a);
                    return sa.runScript(s);
            };
           evalAS2('tell application "System Events" to set visible of every application process to false')
          `)
        return result
        function openMain() {
            ipcRenderer.send('open-main-window', '') //doesn't get called bc window is minimized. right now, it closes all windows
        }
    } catch (error) {
        console.log('error in minimize windows' + error)
    }
    */
}

/****************GRATITUDE NOTES WINDOW ************* */
function openGratitudeNotes() {
    try {
        //   var theDisplay = screen.getPrimaryDisplay()
        // var width = theDisplay.bounds.width
        //var height = theDisplay.bounds.height
        gratitudeWindow = new BrowserWindow({
            width: 900,
            height: 615,
            //   width: 610,
            // height: height,
            //  x: width - 611,
            //  y: 0,
            title: "Gratitude Notes",
            // titleBarStyle: 'hidden',
            //transparent: true,
            //    alwaysOnTop: true, /*remove always on top, because it messes with the app index. The result is that, if this is true, if an app is focused, then other app's windows will not be able to be focused*/
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                // devTools: false
                // enableRemoteModule: true
            }
        })
        gratitudeWindow.loadFile(path.join(__dirname, '/views/gratitude-window.html'));
        gratitudeWindow.openDevTools() /**********remove-in-production*****/
        gratitudeWindow.focus()
    } catch (e) {
        console.log('error in creating gratitude window = ' + e)
    }
}


/****************BREATHE BIG WINDOW */
var breatheWindow

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
        title: "Breathe",
        hasShadow: false,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: false
            // enableRemoteModule: true
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

//end breath big window
ipcMain.on('open-main-window', (event, arg) => {
    createBasicWindow()
    basicWindow.hide()
})

ipcMain.on('hide-main-window', (event, arg) => {
    try {
        basicWindow.show()
        projectWindow.hide()
    } catch (e) {
        console.log('error in hide main window = ' + e)
    }
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
            projectWindow.webContents.send('finished-paste-file', divId, folderPath, newDocPath, updatedFileName, newIndent)
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
                // enableRemoteModule: false,
                sandbox: true,
                devTools: false
            }

        })
        var queryString = '?queryParam870988=' + thePath
        //window.loadURL('file:' + filePath);
        htmlWindow.loadURL('file://' + __dirname + '/views/loaded-html-window.html?${hi}' + queryString);

        //QUERY PARAMS DO NOT WORK FOR CONTENT, BECAUSE IT INTERPRETS STUFF LIKE SPACES, ADDING IN %22, ETC. HAVE TO FIND ANOTHER WAY
    }

}


/****SAVE FOCUSED HTML WINDOW***** */
//not currently in use
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
            //  enableRemoteModule: true,
            // additionalArguments: [thePath, content],
        }
    })
    //window.loadURL('file:' + filePath);
    discourseWindow.loadURL(discourseUrl);
    discourseWindow.webContents.on('will-navigate', function (event, newUrl) {
        discourseWindow.webContents.send('discourse-payload-url', newUrl)
    })
}






/*******BASIC SETUP**** */

app.whenReady().then(() => { //once app is initialized, call the function to create the new browswer window
    openHoverWindow()
    createNavWindow()
    keyBoardShortCut()
    openBasicWindow()
    // createProjectWindow()
    menuApp()


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
    var payload = data.split('redirect?payload=')[1]
    console.log('received data')
    projectWindow.webContents.send('discourse-payload-url', payload)
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
    require('electron-reloader')(module, { ignore: './icons' })
} catch (_) { }


/***************prevent electron from opening a second instance of the app (for example, as a result of the protocol being called on windows)***********************************/


const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (projectWindow) {
            if (basicWindow) {
                basicWindow.hide()
            }
            if (projectWindow.isMinimized()) projectWindow.restore()
            projectWindow.focus()
        } else {
            if (basicWindow) {
                basicWindow.show()
            }

        }
    })
}



