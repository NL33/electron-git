const { ipcRenderer, clipboard, shell, remote } = require('electron')
//const { Menu, MenuItem } = remote
const { writeFile, fstat, readFile, readdirSync, statSync } = require('fs') //can specify what is used here and remove general fs reference below
const fs = require("fs")
var path = require('path')
const simpleGit = require('simple-git')
const git = simpleGit()
var TurndownService = require('turndown')
var turndownService = new TurndownService()
const trash = require('trash');

var proj

var projectFolderName

//const { promisify } = require('util')

//const { default: axios } = require('axios')

//const { setUpDatabase, sendProject } = require('../scripts/post-api');

//const { sendKeysToSite, decodeTheKey, getSecureToken } = require('../scripts/get-key')

/*
function discourseAPI(){
    sendProject(projectFolderPath, projectFolderName)
}
*/
/*
function startAPIKeyProcess(){
    sendKeysToSite()
}

function getTokenSecure(){
    getSecureToken()

}
*/
/*
ipcRenderer.on("discourse-payload-url", (event, payload) => {
    decodeTheKey(payload);
});
*/
/*****Button Set Up *****/
window.onload = async function () {
    try {
        // await setUpDatabase()
        window.addEventListener('click', function (e) {
            if (document.getElementById('folderContents').contains(e.target)) {
                // Clicked in box
            } else {
                var highlightedDivs = document.getElementsByClassName('highlightFolderOrFile')
                while (highlightedDivs.length)
                    highlightedDivs[0].classList.remove('highlightFolderOrFile')
            }
        });

        //will send file to discourse, linking with postId. how will it link with project? When send to site, project will probably be named after main-folder-name/subfolder. Can get this from the filepath. And then add the tag with this name and a hash to the post, so it will be tagged that way on discourse.
        //start out this way. Issues in future: if change path name, will that change project? maybe it's ok for it to work that way?


        /****** REMOVE ANY WORK TREES CREATED BY THE APP*********** */
        if (localStorage.getItem('working-trees-present')) {
            let treeArray = JSON.parse(localStorage.getItem('working-trees-present'))
            if (treeArray.length > 0) {
                treeArray.forEach((treePath) => {
                    if (treePath.length) {
                        removeSavedWorkTree(treePath)
                    }
                })
            }
        }
        /*
                document.getElementById('viewPriorVersionsSelect').addEventListener('click', () => {
                    viewPriorVersionsFunction()
                })
        
                document.getElementById('compareChangesSelect').addEventListener('click', () => {
                    showCompareChangesFunction()
                })
        */
        //get last project folder info
        if (localStorage.getItem('lastProjectFolder')) {
            let folderArray = JSON.parse(localStorage.getItem('lastProjectFolder'))
            if (folderArray) {
                projectFolderPath = folderArray[0]
                projectFolderName = folderArray[1]
                document.getElementById('projectDirectory').textContent = projectFolderName
                var divId = "projectDirectory"
                showFolderContents(divId, projectFolderPath, 0)
            }
        }

        //change project folder button
        var changeFolderButton = document.getElementById('changeFolder')
        changeFolderButton.addEventListener('click', () => {
            console.log('clicked change folder button')
            changeFolder()
            //openDocFunction()
            //openDocSpawn()
            // wordExps()
        })

        //click save button

        document.getElementById('saveButton').addEventListener('click', () => {
            saveGitVersion()
        })

        //set right click menu 
        menuFunction()

        checkIfDescriptionExists()

        tabFunction()
    } catch (e) {
        console.log('error in onload function')
    }
}   //end window onload

function showSaveVersion() {
    document.getElementById('saveProjectVersion').style.display = 'block'
    document.getElementById('optionsAtBottom').style.display = 'none'
    document.getElementById('folderContents').style.marginBottom = '180px'
    document.getElementById('noteForSave').focus()
}

function closeSaveView() {
    document.getElementById('savingProgress').style.display = "none"
    document.getElementById('saveProjectVersion').style.display = 'none'
    document.getElementById('optionsAtBottom').style.display = 'block'
    document.getElementById('folderContents').style.marginBottom = '90px'
}

function priorVersionsFunction() {
    ipcRenderer.send('open-prior-version-overview', projectFolderPath, projectFolderName)
}

function tabFunction() {
    try {
        document.getElementById('noteForSave').addEventListener('keydown', (event) => {
            if (event.which == 9) {
                console.log('tab hit')
                saveGitVersion()

            }
        })
    } catch (e) {
        console.log('error in tab function')
    }
}

/******HIDE WINDOW, AND SHOW BASIC WINDOW**** */

function hideWindow() {
    ipcRenderer.send('hide-main-window', '')
}

/****open Navigator Window *********/

function openNavigator() {
    ipcRenderer.send('open-nav-window', '')
}

/**SHOW PROJECT DESCRIPTION************** */
async function checkIfDescriptionExists() {
    try {
        var descFilePath = projectFolderPath + '/project-summary.md'
        fs.stat(descFilePath, function (err, stat) {
            if (err == null) {
                //file exists
                document.getElementById('addSummaryButton').style.display = 'none'
            } else if (err.code === 'ENOENT') {
                document.getElementById('addSummaryButton').style.display = 'inline-block'
            } else {
                console.log('Some other error: ', err.code);
            }
        });
    }
    catch (e) {
        console.log('error in checking for description = ' + e)
    }
}

async function addSummary() {
    try {
        /*Make a file of project-summary:*/
        var descFilePath = projectFolderPath + '/project-summary.md'
        fs.stat(descFilePath, function (err, stat) { //just a doublecheck in case file already exists. In most instances, this will already be done through checkIfDescriptionExists function
            if (err == null) {
                //file exists
                document.getElementById('addSummaryButton').style.display = 'none'
            } else if (err.code === 'ENOENT') {
                // file does not exist
                fs.writeFile(descFilePath, '', (err) => {
                    if (err) {
                        console.log(err)
                    } else {
                        //file created
                        var indent = 0
                        var newIndent = parseInt(indent) + 15
                        var newId = "**is-document**^^^" + descFilePath + "^^^" + indent
                        var newId = "**is-document**^^^" + descFilePath + "^^^" + indent
                        contents = `<div>
                                <div class='subFolder docOrDirectory newDiv' style='margin-left: ${indent}px' id="${newId}" onclick='showFolderContents("${newId}", "${descFilePath}", "${newIndent}")'><span class="material-icons-outlined greenFile icon" >insert_drive_file </span>` + 'project-summary.md' + `</div>
                                </div>`
                        var contentsDiv = document.getElementById('folderContents')
                        contentsDiv.insertAdjacentHTML("afterbegin", contents)
                        openDoc(descFilePath)
                        var highlightedDivs = document.getElementsByClassName('highlightFolderOrFile')
                        while (highlightedDivs.length)
                            highlightedDivs[0].classList.remove('highlightFolderOrFile')
                        document.getElementById(newId).classList.add('highlightFolderOrFile')
                        document.getElementById('addSummaryButton').style.display = 'none'
                    }
                })
            } else {
                console.log('Some other error in adding description function = ', err.code);
            }
        });
    }
    catch (e) {
        console.log('error in adding description function = ' + e)
    }
}


/********CONTROLLING APPLE NOTES ************************* */
/*
var appleNoteHtmlContent
async function addAppleNote(divId, mainPath, indent) {
    var newIndent = parseInt(indent) + 17
    console.log('get apple note file')
    try {
        getFrontNote().then((response) => {
            appleNoteHtmlContent = response.noteContent
            var noteId = response.noteId
            var element = document.getElementById(divId)
            contents = `<form action="#" id="addAppleNoteForm" style="margin-left: ${newIndent}px;" onsubmit='createAppleNoteFile("${divId}", "${mainPath}", "${indent}", "${noteId}")'>
                <input type="text" class="docOrDirectory"  id="appleNoteNameEntry" data-placeholder="folder name"  style="padding: 2px; padding-left: 2px" name="txt" /><span onclick="newFolderNoFocus()" style="color: #778899; cursor: pointer; margin-left: 4px; padding: 4px; vertical-align: super">x</span>
                </form>
                `

            var newItems = element.nextElementSibling  //gets "newItems" div
            newItems.insertAdjacentHTML("afterBegin", contents)  //insert into newItems
            document.getElementById('appleNoteNameEntry').value = response.noteName + ' (apple-note).html'
        })
    } catch (error) {
        console.log('error in addAppleNote = ' + error)
    }
}
async function getFrontNote() { //get the text of the apple note in the foreground
    // (async () => {
    try {
        const result = await runJxa(`
        console.log('running')
            const evalAS2 = s => {
                    const a = Application.currentApplication();
                    const sa = (a.includeStandardAdditions = true, a);
                    return sa.runScript(s);
            };
            var noteName = evalAS2('tell application "Notes" to get the name of item 1 of (get selection)');
            var noteId = evalAS2('tell application "Notes" to get the id of item 1 of (get selection)');
            var noteContent = evalAS2('tell application "Notes" to get body of item 1 of (get selection)');
            return {'noteName': noteName, 'noteId': noteId, 'noteContent': noteContent}
            `)
        return result
    } catch (error) {
        console.log('error in trying to get note information ' + error)
    }
    //})();
}

async function createAppleNoteFile(divId, folderPath, indent, noteId) {
    //this checks if an apple note with that id already exists.
    //when click "add apple note", it should automatically check if there is an existing matching note before it gives you the chance to rename. If there is an existing matching note, DON't show the spot to name the file. Just update the existing file with the name of the note on the system.
    //If you then want to change the name, you can do so with the right click menu.
        will have to show a spinner while the activity is happening, and then a confirmation message once the note has been updated
        will also want to check that the async timing is working ok

    var fileName = document.getElementById('appleNoteNameEntry').value
    document.getElementById('addAppleNoteForm').remove()
    var newDocPath = folderPath + '/' + fileName
    var folderArray = await fs.readdirSync(folderPath)
    var appleNoteFiles = []
    folderArray.forEach((item) => {
        if (item.includes('(apple-note)')) {
            console.log('There is an apple note: ' + item)
            appleNoteFiles.push(item)
        }
    })
    var matchingNotePath = 'n/a'

    appleNoteFiles.forEach((note) => {  //go through the apple notes to see if one of them has the same id. NOTE: Currently, this only works for the same directory. Will not update apple notes in a different directory, even if the same id
        var theNotePath = folderPath + '/' + note

        try {
            var data = fs.readFileSync(theNotePath, 'utf8')
            var dataInfo = data.substring(
                data.lastIndexOf('<span id="noteId81423">') + 23,
                data.lastIndexOf('</span>')
            )

            if (dataInfo === noteId) {
                matchingNotePath = theNotePath  //if match in ids, then set the matching note as the matchingNotePath
            }
        } catch (err) {
            console.log('error in reading apple note file = ' + err)
        }
    })

    if (matchingNotePath !== 'n/a') {
        try {
            fs.renameSync(matchingNotePath, newDocPath, () => {
                console.log('the matching note has been renamed to the new note.')
            })
        } catch (err) {
            console.log('error in renamig = ' + err)
        }
    }

    var updatedContent = appleNoteHtmlContent.replaceAll('<div><u><br></u></div>', '').replaceAll('<u><br></u>', '').replaceAll('<h1><br></h1>', '').replaceAll('<h2><br></h2>', '').replaceAll('<h3><br></h3>', '')
    var colorStyleInsert = `
<style>
body {
color: #353535;
padding-left: 10px;
padding-right: 10px
}
h1, h2, h3 {
margin-bottom: 1px;
margin-top: 1px
}
ul {
margin-top: 0px;
margin-bottom: 0px
}
</style>
    `

    var newIndent = parseInt(indent) + 15
    var element = document.getElementById(divId)
    var content = colorStyleInsert + '<div style="margin-bottom: 12px; display: none">id:<span id="noteId81423">' + noteId + '</span></div>' + updatedContent  //noteId span name is given the code 81423 to make it unlikely someone will print that exact string in their own notes
    fs.writeFile(newDocPath, content, function (err) {
        if (err) {
            console.log(err)
        } else {
            //var newItems = div.nextElementSibling
            // newItems.innerHTML = ''
            //   e.target.classList.remove('clicked') //removed so that it can run showFolderContents function
            if ((element.classList.contains('clicked')) || (divId === "projectDirectory")) {
                //the folder that's getting the new folder is already open (ie, showing its contents), so just add the single new folder
                showNewFolderOrDoc(divId, folderPath, newDocPath, fileName, newIndent)
            } else {
                //folder that's getting the new folder is not displaying its contents, so just show all contents like normal
                showFolderContents(divId, folderPath, newIndent)
            }
        }
    })
}
*/
/******************FUNCTION TO REMOVE ANY WORK TREES CREATED BY THE APP******************************** */

async function removeSavedWorkTree(treePath) {
    //checks local storage for any work tree references. If any found, then remove them.
    try {
        await fs.rm(treePath, { recursive: true }, (err) => {
            console.log('deleted: removed work tree = ' + treePath)
            if (err) {
                if (err.code === 'ENOENT') {
                    console.log('attempted to remove worktree, but worktree not present. Should not be a concern. Worktree path = ' + treePath)
                    console.log('will now remove that work tree reference from local storage')
                    let treeArray = JSON.parse(localStorage.getItem('working-trees-present'))
                    let index = treeArray.indexOf(treePath)
                    if (index > -1) {
                        treeArray.splice(index, 1)
                        localStorage.setItem('working-trees-present', JSON.stringify(treeArray))
                        console.log('local storage now = ' + localStorage.getItem('working-trees-present'))
                    }
                    console.log('done')
                } else {
                    console.log('error in remove worktree action. error = ' + err)
                }
            } else {
                let treeArray = JSON.parse(localStorage.getItem('working-trees-present'))
                let index = treeArray.indexOf(treePath)
                if (index > -1) {
                    treeArray.splice(index, 1)
                    localStorage.setItem('working-trees-present', JSON.stringify(treeArray))
                    console.log('local storage now = ' + localStorage.getItem('working-trees-present'))
                }
            }
        })
    } catch (e) {
        console.log('error in removing work tree = ' + e)
    }
}

/*****REMOVE WORKTREE CREATED IN THE PRIOR VERSION OVERVIEW WINDOW WHEN CLOSE THE WINDOW***** */
ipcRenderer.on('close-worktree', (event, arg) => {
    removeWorkTree(arg)
})


async function removeWorkTree(treePath) {
    //after do prior versions action, this is a backup function to remove any leftover work trees. Likely not necessary, but left in here just in case
    var thisTreeName = path.basename(treePath)
    console.log('inremove tree. name = ' + thisTreeName)
    try {
        await git.cwd(projectFolderPath).then(result => {
            // console.log('cwd resultss' + JSON.stringify(result))
        })
        if (thisTreeName) {
            /*"--force" is included because its necessary if you are deleting a worktree with modified files.In this case, that is required: 1. user could change files(accidentally), 2. by adding a notation like "old" to the front of files you are modifying the folder.*/
            await git.raw('worktree', 'remove', thisTreeName, '--force').then((result) => {
                if (localStorage.getItem('working-trees-present')) {  //local storage array is to keep track of worktrees created, so as to delete them in the case the app is not shut down properly (they would be deleted on startup)
                    let treeArray = JSON.parse(localStorage.getItem('working-trees-present'))
                    let theTreePath = projectFolderPath + '/' + thisTreeName
                    let index = treeArray.indexOf(theTreePath)
                    if (index > -1) {
                        treeArray.splice(index, 1)
                        localStorage.setItem('working-trees-present', JSON.stringify(treeArray))
                        console.log('local storage now = ' + localStorage.getItem('working-trees-present'))
                    }
                }
            }) //delete that folder
            await git.raw('worktree', 'prune').then((result) => { //removes info about worktrees which no longer exist
            })
        }
    } catch (e) {
        console.log('error in removework = ' + e)
    }
}



/*****Open Doc***** */

async function openDoc(thePath) {
    try {
        let theExtension = path.extname(thePath)
        /*
        if (thePath.includes('(apple-note)')) { //if apple note. then open the apple note doc directly
            var theNoteId
            try {
                var data = fs.readFileSync(thePath, 'utf8')
                theNoteId = data.substring(
                    data.lastIndexOf('<span id="noteId81423">') + 23,
                    data.lastIndexOf('</span>')
                )
            } catch (err) {
                console.log('error in reading apple note file = ' + err)
            }

            try {
                await runJxa(`
            'use strict';

            // evalAS2 :: String -> IO a
            const evalAS2 = s => {
                const a = Application.currentApplication();
                const sa = (a.includeStandardAdditions = true, a);
                return sa.runScript(s);
            };

             return evalAS2('tell application "Notes" to show note id "${theNoteId}"')
            `)
            } catch (e) {//if there's an error in trying to open the apple note, can just go ahead and open the file through the app.
                console.log('error in opening note = ' + e)
                fs.readFile(thePath, 'utf8', function (err, data) {
                    if (err) {
                        console.log(err)
                    } else {
                        ipcRenderer.send('open-html-window', thePath, data)
                    }
                })
            }

        } else */
        if (theExtension.includes('html')) { //if not apple note but is an html file, open that file
            ipcRenderer.send('open-html-window', thePath)

        } else { //open the file directly
            shell.openPath(thePath)
        }
    } catch (e) {
        alert('Sorry, there was an error showing this doc.')
    }
}


/*
function openDocFunction() {

    shell.openPath(wordDoc, '', 'x=10, y=10').then((result) => {
        console.log(result)
    })

    //window.open(txtDoc, '_blank','top=300, left=600')
}


function openDocSpawn() {

    var exec = require('child_process').exec;
    var command = 'open ' + wordDoc
    exec(command, function (error, stdout, stderr) {  // 'dir' is for example
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
    });
}
*/
/*************************************Select Project Folder to show folder contents*******************************/

function changeFolder() {
    console.log('send change folder')
    ipcRenderer.send('open-folder-dialog', '')
}

ipcRenderer.on('selected-folder', (event, pathToFolder) => {
    document.getElementById('folderContents').innerHTML = ''
    projectFolderPath = pathToFolder.toString()
    let dataArray = projectFolderPath.split("/")
    projectFolderName = dataArray[dataArray.length - 1]
    document.getElementById('projectDirectory').textContent = projectFolderName
    var divId = "projectDirectory"
    showFolderContents(divId, projectFolderPath, 0)
    if (projectFolderPath.length > 0) { //should always be true, but adding a doublecheck
        console.log('set local storage')
        let array = [projectFolderPath, projectFolderName]
        localStorage.setItem('lastProjectFolder', JSON.stringify(array))
    }
    checkIfDescriptionExists()
})

/******Loop through contents of Selected Folder and display results************* */
//main-function
async function showFolderContents(divId, mainPath, indent) {
    try {
        var element = document.getElementById(divId)
        var highlightedDivs = document.getElementsByClassName('highlightFolderOrFile')
        while (highlightedDivs.length)
            highlightedDivs[0].classList.remove('highlightFolderOrFile')
        if (element.id !== 'projectDirectory') {
            element.classList.add('highlightFolderOrFile')
        }
        var extension = path.extname(mainPath)
        var hasExtension = false
        if (extension) {
            hasExtension = true  //why this? Below, with stats.isDirectory(), you can check if something is a directory. However, this misses a few special types of "directories"--which are really complex files. For example logicX files. These files show up as directories with isDirectory(), but when you click on them, you normally want to open them, not view the contents. So this code pickes up these cases.
        }
        if ((divId === 'projectDirectory') || (!(element.classList.contains('clicked')))) {
            var stats = fs.statSync(mainPath)
            if ((stats.isDirectory() === true) && (hasExtension === false)) { //determine if a directory (instead of file). 
                //show folder contents
                var contentArray = []
                try {
                    contentArray = fs.readdirSync(mainPath)
                } catch (e) {
                    console.log(e)
                }
                var contents = ""
                var newIndent = parseInt(indent) + 15
                contentArray.forEach((item) => {
                    if ((item != '.DS_Store') && (item != ".git") && (!(item.includes('worktree3a7c1e4g7')))) {
                        var fullPath = mainPath + '/' + item
                        var subStats = fs.statSync(fullPath)
                        var extension1 = path.extname(fullPath)
                        var hasExtension1 = false
                        if (extension1) {
                            hasExtension1 = true  //why this? Below, with stats.isDirectory(), you can check if something is a directory. However, this misses a few special types of "directories"--which are really complex files. For example logicX files. These files show up as directories with isDirectory(), but when you click on them, you normally want to open them, not view the contents. So this code pickes up these cases.
                        }
                        if ((subStats.isDirectory() === true) && (hasExtension1 === false)) {
                            var newId = "**is-directory**^^^" + fullPath + "^^^" + indent
                            contents = `<div style='margin-left: ${indent}px'>
                        <div class='subFolder docOrDirectory' style="padding-left: 3px; padding-right: 3px" id="${newId}" onclick='showFolderContents("${newId}", "${fullPath}", "${newIndent}")'><span class="material-icons-outlined blueFolder icon">folder_open</span>` + item + `</div>
                        <div class="newItems"></div>
                        </div>`
                        } else {
                            var newId = "**is-document**^^^" + fullPath + "^^^" + indent
                            contents = `<div >
                        <div class='subFolder docOrDirectory' style='margin-left: ${indent}px' id="${newId}" onclick='showFolderContents("${newId}", "${fullPath}", "${newIndent}")'><span class="material-icons-outlined greenFile icon" >insert_drive_file </span>` + item + `</div>
                        </div>`
                        }
                    }
                    if (divId !== "projectDirectory") {
                        var newItems = element.nextElementSibling  //gets "newItems" div
                        newItems.insertAdjacentHTML("beforeEnd", contents)  //insert into newItems
                        element.classList.add('clicked') //add clicked class so don't run this again if click again
                    } else {
                        var contentsDiv = document.getElementById('folderContents')
                        if (item.indexOf('project-summary') > -1) {
                            contentsDiv.insertAdjacentHTML("afterBegin", contents)
                        } else {
                            contentsDiv.insertAdjacentHTML("beforeEnd", contents)
                        }
                    }
                })
            } else {  //if not a directory
                openDoc(mainPath)
            }
        } else { //if not projectstart and DO have clicked (so a folder that is already open)
            element.classList.remove('clicked')
            var newItems = element.nextElementSibling
            newItems.innerHTML = '' //remove items in newItems
        }
    } catch (e) {
        console.log('error in showing folder contents')
        alert('Sorry, there was an error in showing these contents. Please try again.')
    }
}
//<img src="../clear-folder-fntawesome.svg" style="height: 11pt; width: 9pt; vertical-align: unset"></img>

/*****************************************Menu Function***************************************************/

function menuFunction() {
    window.addEventListener('contextmenu', (e) => {
        try {
            if ((e.target.id) && (e.target.classList.contains('docOrDirectory'))) {
                var fullId = e.target.id
                console.log('clicked folder')
                /*
                contextMenu.clear() //remove prior menuItem. PROBABLY NEED THIS
                e.preventDefault();
*/
                if (fullId.includes('**is-directory**')) { //show this menu only if a directory
                    console.log('is directory')
                    var idArray = fullId.split("^^^")
                    var thePath = idArray[1]
                    var indent = idArray[2]
                } else if (fullId === "projectDirectory") {
                    console.log("project directory")
                    var thePath = projectFolderPath
                    var indent = -15
                }
                var divId = fullId
               console.log('prir to send')
               console.log('div id = ' + divId)
                ipcRenderer.send('show-context-menu-projwindow-directory', JSON.stringify(e.target), divId, thePath, indent)
            }

            if (fullId !== 'projectDirectory') {
                /* IF DOC, FOR DELETING IT:
                contextMenu.append(new MenuItem({
                    label: "Move to Trash",
                    click: () => {
                        deleteItem(e)
                    }
                }))
              */
            }

        } catch (e) {
        console.log('error in adding menu function = ' + e)
    }
}, false);
}

function viewFolder(e, thePath) {
    var theFolder = thePath
    shell.openPath(theFolder)
}


/*old code: onblur="newFolderNoFocus()"*/
/****INPUT TO ENTER NEW FOLDER AND FILE ********* */
/* Steps of creating new folder:
1. enterNewFolder function: adds entry box. When click return in the box, goes to addFolder function
2. add folder does mkdir code., then goes to
3. showNewFolderOrDoc or showFolderContents to show the new folder
*/
ipcRenderer.on('enter-new-folder', (event, divId, thePath, indent)=>{
    enterNewFolder(divId, thePath, indent)
})

function enterNewFolder(divId, mainPath, indent) {
    console.log(divId + ' ; ' + mainPath + ' ; ' + indent)
    console.log('enter new folder now')
    var newIndent = parseInt(indent) + 17
    var element = document.getElementById(divId)
    contents = `<form action="#" id="addForm" style="margin-left: ${newIndent}px" onsubmit='addFolder("${divId}", "${mainPath}", "${indent}")'>
                <input type="text" class="docOrDirectory"  id="nameEntry" data-placeholder="folder name"  style="padding: 2px; padding-left: 2px" name="txt" /><span onclick="newFolderNoFocus()" style="color: #778899; cursor: pointer; margin-left: 4px; padding: 4px; vertical-align: super">x</span>
                </form>
                `
    var newItems = element.nextElementSibling  //gets "newItems" div
    newItems.insertAdjacentHTML("afterBegin", contents)  //insert into newItems
    document.getElementById('nameEntry').focus()
}

function enterNewFile(divId, mainPath, indent) {
   
    var newIndent = parseInt(indent) + 17
    var element = document.getElementById(divId)
    contents = `<form action="#" id="addForm" style="margin-left: ${newIndent}px" onsubmit='createFile("${divId}", "${mainPath}", "${indent}")'>
                <input type="text" class="docOrDirectory"  id="nameEntry" data-placeholder="folder name"  style="padding: 2px; padding-left: 2px" name="txt" /><span onclick="newFolderNoFocus()" style="color: #778899; cursor: pointer; margin-left: 4px; padding: 4px; vertical-align: super">x</span>
                </form>
                `
    var newItems = element.nextElementSibling  //gets "newItems" div
    newItems.insertAdjacentHTML("afterBegin", contents)  //insert into newItems
    document.getElementById('nameEntry').focus()
}

function enterNewPasteFile(divId, mainPath, indent) {
    var newIndent = parseInt(indent) + 17
    var element = document.getElementById(divId)
    contents = `<form action="#" id="addForm" style="margin-left: ${newIndent}px" onsubmit='createPasteFile("${divId}", "${mainPath}", "${indent}")'>
                <input type="text" class="docOrDirectory"  id="nameEntry" data-placeholder="folder name"  style="padding: 2px; padding-left: 2px" name="txt" /><span onclick="newFolderNoFocus()" style="color: #778899; cursor: pointer; margin-left: 4px; padding: 4px; vertical-align: super">x</span>
                </form>
                `

    var newItems = element.nextElementSibling  //gets "newItems" div
    newItems.insertAdjacentHTML("afterBegin", contents)  //insert into newItems
    document.getElementById('nameEntry').focus()
}

function newFolderNoFocus() {
    if (document.getElementById('addForm')) {
        document.getElementById('addForm').remove()
    } else if (document.getElementById('addAppleNoteForm')) {
        document.getElementById('addAppleNoteForm').remove()
    }
}

/*************************CREATE A FOLDER ********************/
function addFolder(divId, path, indent) {
    try {
        var folderName = document.getElementById('nameEntry').value
        document.getElementById('addForm').remove()
        var newPath = path + '/' + folderName
        var newIndent = parseInt(indent) + 15
        var element = document.getElementById(divId)
        fs.mkdir(newPath, function (err) {
            if (err) {
                console.log(err)
            } else {
                //var newItems = div.nextElementSibling
                // newItems.innerHTML = ''
                //   e.target.classList.remove('clicked') //removed so that it can run showFolderContents function
                if ((element.classList.contains('clicked')) || (divId === "projectDirectory")) {
                    //the folder that's getting the new folder is already open (ie, showing its contents), so just add the single new folder
                    showNewFolderOrDoc(divId, path, newPath, folderName, newIndent)
                } else {
                    //folder that's getting the new folder is not displaying its contents, so just show all contents like normal
                    showFolderContents(divId, path, newIndent)
                }

            }
        })
    } catch (e) {
        alert('Sorry, there was an error in adding the folder. Please try again.')
    }
}

/****************** CREATE A FILE **************************/

function createFile(divId, path, indent) {
    try {
        var fileName = document.getElementById('nameEntry').value
        document.getElementById('addForm').remove()
        var newPath = path + '/' + fileName
        var newIndent = parseInt(indent) + 15
        var element = document.getElementById(divId)
        fs.writeFile(newPath, '', function (err) {
            if (err) {
                console.log(err)
            } else {
                //var newItems = div.nextElementSibling
                // newItems.innerHTML = ''
                //   e.target.classList.remove('clicked') //removed so that it can run showFolderContents function
                if ((element.classList.contains('clicked')) || (divId === "projectDirectory")) {
                    //the folder that's getting the new folder is already open (ie, showing its contents), so just add the single new folder
                    showNewFolderOrDoc(divId, path, newPath, fileName, newIndent)
                } else {
                    //folder that's getting the new folder is not displaying its contents, so just show all contents like normal
                    showFolderContents(divId, path, newIndent)
                }
            }
        })
    } catch (e) {
        console.log('Sorry, there was an error in creating the file. Please try again.')
    }
}

/*******************CREATE A PASTE FILE ****************************/
//hit create paste file button, and app creates file, pastes in clipboard, and, if no extension specified when you create it, adds "html" extension.
//the html extension means that when you open it, it will open in an app window, that will render the html 
//the expectation is that most times of using a paste file is getting content from the web--an email, a website, etc...
//so rendering the html will be the best representation of the data
function createPasteFile(divId, folderPath, indent) {
    try {
        var fileName = document.getElementById('nameEntry').value
        document.getElementById('addForm').remove()
        var newDocPath1 = folderPath + '/' + fileName
        var pathExtension = path.extname(newDocPath1)
        if (pathExtension.length) { //people can still specify an extension if they want
            var newDocPath = newDocPath1
            var updatedFileName = fileName
        } else { //if not, go with html
            var newDocPath = newDocPath1 + '.html'
            var updatedFileName = fileName + '.html'
        }

        var newIndent = parseInt(indent) + 15
        ipcRenderer.send('create-paste-file', divId, folderPath, newDocPath, updatedFileName, newIndent)
    } catch (e) {
        console.log('Sorry, there was an error in creating the file. Please try again.')
    }
}

ipcRenderer.on('finished-paste-file', (event, divId, folderPath, newDocPath, updatedFileName, newIndent) => {
    console.log('received finished-paste-file')
    var element = document.getElementById(divId)
    if ((element.classList.contains('clicked')) || (divId === "projectDirectory")) {
        //the folder that's getting the new folder is already open (ie, showing its contents), so just add the single new folder
        showNewFolderOrDoc(divId, folderPath, newDocPath, updatedFileName, newIndent)
    } else {
        //folder that's getting the new folder is not displaying its contents, so just show all contents like normal
        showFolderContents(divId, folderPath, newIndent)
    }
})


function updatePasteFile(e) {
    var content = clipboard.readText()
    var targetDiv = e.target
    var filePath = targetDiv.id.split('^^^')[1]  //id of docs has structure = ***is-directory***^^^/Users/[pathandname]^^^indentnumber
    /*Consider adding a dialog saying: confirm update file with [the first lines of text] to make sure this is on purpose.*/
    fs.writeFile(filePath, content, function (err) {
        if (err) {
            console.log(err)
            /**Can add dialog saying: Sorry, there was a problem updating this doc */
        } else {
            console.log('paste doc updated')
            /**Can add a dialog confirming this worked */
        }
    })


}


/**************** showNewFolder ANd new Doc *******************/

function showNewFolderOrDoc(divId, mainPath, newPath, folderName, indent) {
    //goal: insert new file alphabetically into view of the directory
    try {
        var contentArray = []
        try {
            contentArray = fs.readdirSync(mainPath) //note: this is plugging into the file system, where the new file already exists. So the new file is already in the content array
        } catch (e) {
            console.log(e)
        }
        let itemArray = []
        contentArray.forEach((item) => {
            if ((item != '.DS_Store') && (item != ".git") && (!(item.includes('worktree3a7c1e4g7')))) { //code that shows the folder contents excludes these items. so want to exclude them here too to get the right index
                itemArray.push(item)
            }
        })

        var indexGo = itemArray.indexOf(folderName)
        var element = document.getElementById(divId)
        var contents = ""
        var newIndent = parseInt(indent) + 15
        var fullPath = newPath
        var statsHere = fs.statSync(fullPath)
        if (statsHere.isDirectory() === true) {
            var newId = "**is-directory**^^^" + fullPath + "^^^" + indent
            contents = `<div>
                <div class='subFolder docOrDirectory newDiv' style='margin-left: ${indent}px' id="${newId}" onclick='showFolderContents("${newId}", "${fullPath}", "${newIndent}")'><span class="material-icons-outlined blueFolder icon">folder_open</span>` + folderName + `</div>
                <div class="newItems"></div>
                </div>`
        } else {
            var newId = "**is-document**^^^" + fullPath + "^^^" + indent
            contents = `<div>
                <div class='subFolder docOrDirectory newDiv' style='margin-left: ${indent}px' id="${newId}" onclick='showFolderContents("${newId}", "${fullPath}", "${newIndent}")'><span class="material-icons-outlined greenFile icon" >insert_drive_file </span>` + folderName + `</div>
                </div>`
        }

        if (divId === 'projectDirectory') { //its the project folder
            var contentsDiv = document.getElementById('folderContents')
        } else {
            var contentsDiv = element.nextElementSibling //not the project directory (so a subfolder). So structure is parent, then sibling where contents are

        }
        if (indexGo === 0) {
            contentsDiv.insertAdjacentHTML("afterbegin", contents)
        } else {
            var divBefore = contentsDiv.children[indexGo]
            if (divBefore) {
                divBefore.insertAdjacentHTML("beforebegin", contents)
            } else {
                contentsDiv.insertAdjacentHTML("afterbegin", contents)
            }
        }

        var highlightedDivs = document.getElementsByClassName('highlightFolderOrFile')
        while (highlightedDivs.length)
            highlightedDivs[0].classList.remove('highlightFolderOrFile')
        document.getElementById(newId).classList.add('highlightFolderOrFile')
    } catch (e) {
        console.log('error in adding new folder or doc to view')
    }
}


/*******************DELETE A FOLDER****************************/

async function deleteItem(e) {
    try {
        var fullId = e.target.id
        var item = document.getElementById(fullId)
        var idArray = fullId.split("^^^")
        var thePath = idArray[1]
        await trash([thePath]).then(() => {
            if (fullId.includes('is-directory')) {
                var newItems = item.nextElementSibling
                if (newItems) {
                    newItems.innerHTML = '' //remove items in newItems
                }
                item.remove()
            }
            item.remove()
            if (thePath.indexOf('project-summary') > -1) {
                checkIfDescriptionExists()
            }

        });
    } catch (e) {
        console.log('error in delete item = ' + e)
        alert('Sorry, there was an error in deleting this item. Please try again.')
    }

}


/*************************************VIEW PRIOR VERSIONS *****************************************/


//Current Code. Start here:
/*
plan: click prior versions window, and it opens a new prior versions window. Default view is just prior versions. click version and window closes, and you open a new window for the version

in that new window, there is also option (at bottom click?) to compare changes, which loads compare changes window. Same thing--select your changes, and new window opens with compare changes, and existing window closes.

So the key changes is to move the javascript and html of prior versions/compare changes that's currently in main-window, into prior-versions-overview window. 

then just need to call that window from main window to main.js

STATUS:

I just created a new view: prior-versions-overview. and added initial html code
next: move the right javacsript code for viewing prior versions into prior-versions-overview.




*/





/********GIT ACTIONS*************** */

async function saveGitVersion() {
    console.log('in save version')
    var text = document.getElementById('noteForSave').innerHTML.replaceAll('<div><br></div>', '\n\n').replaceAll('<div>', '').replaceAll('</div>', '') //textContent
    if (text.length < 1) {
        text = "new version saved"
    }
    document.getElementById('saveProjectItems').style.display = "none"
    document.getElementById('savingProgress').style.display = "inline-block"
    document.getElementById('saveProjectHeader').style.display = "none"
    try {

        /**STEPS FROM HERE: Create file with commit notes (including checking if already exists). Create file if necessary. Then, after notes file has been updated, run the commit */

        /*Make a file of commit notes:*/
        var commitTextFilePath = projectFolderPath + '/z-version-notes.md'
        fs.stat(commitTextFilePath, function (err, stat) {
            if (err == null) {
                //file exists
                fs.readFile(commitTextFilePath, 'utf8', (err, data) => {
                    if (err) {
                        console.log('error = ' + err)
                    } else {
                        var dateObject = new Date()
                        var showDate = dateObject.toLocaleDateString('en-us', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })
                        var showTime = dateObject.toLocaleTimeString('en-us', {
                            timeStyle: 'short'
                        })
                        var cleanedTime = showTime.replace("AM", "am").replace("PM", "pm")
                        var showTime = '**' + showDate + ' ' + cleanedTime + '**' + '\n\n'
                        var newData = showTime + text + '\n\n\n' + data
                        fs.writeFile(commitTextFilePath, newData, (err) => {
                            if (err) {
                                console.log(err)
                            } else {
                                //********FILE UPDATED. NOW MAKE THE COMMIT****** */
                                doTheCommit(text)
                            }
                        })
                    }
                })
            } else if (err.code === 'ENOENT') {
                // file does not exist
                var dateObject = new Date()
                var showDate = dateObject.toLocaleDateString('en-us', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })
                var showTime = dateObject.toLocaleTimeString('en-us', {
                    timeStyle: 'short'
                })
                var cleanedTime = showTime.replace("AM", "am").replace("PM", "pm")
                var showTime = '**' + showDate + ', ' + cleanedTime + '**' + '\n\n'
                var newData = showTime + text + '\n\n\n'
                fs.writeFile(commitTextFilePath, newData, (err) => {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log('file created')
                        var indent = 0
                        var newIndent = parseInt(indent) + 15
                        var newId = "**is-document**^^^" + commitTextFilePath + "^^^" + indent
                        contents = `<div>
                                <div class='subFolder docOrDirectory newDiv' style='margin-left: ${indent}px' id="${newId}" onclick='showFolderContents("${newId}", "${commitTextFilePath}", "${newIndent}")'>` + 'z-version-notes.md' + `</div>
                                </div>`
                        var contentsDiv = document.getElementById('folderContents')
                        contentsDiv.insertAdjacentHTML("beforeend", contents)
                        //********FILE CREATED. NOW MAKE THE COMMIT****** */
                        doTheCommit(text)
                    }
                })
            } else {
                console.log('Some other error: ', err.code);
            }
        });
        /*
        await git.raw('remote', 'get-url', '--push', 'origin').then(result => {  //thiswould be to push to github
            console.log('get remote result = ' + JSON.stringify(result))
            //if lists a remote at github that doesn't exist, will send back an error
            document.getElementById('remoteName').textContent = result
        })
        */

    }
    catch (e) {
        console.log('error = ' + e)
        alert("Sorry, there was an error saving this version. Please try again.")
    }
}

async function doTheCommit(text) { //Where the actual version commit is done.
    try {
        await git.cwd(projectFolderPath).then(result => {
            // console.log('cwd resultss' + JSON.stringify(result))
        })
        await git.init().then(result => {
            //console.log('init result = ' + JSON.stringify(result))
        })

        await git.add('.').then(result => {
            //console.log('add result = ' + JSON.stringify(result))
        })

        await git.commit(text).then(result => {

            document.getElementById('savingProgress').style.display = "none"
            document.getElementById('saveProjectHeader').style.display = "block"
            document.getElementById('noteForSave').textContent = ''
            document.getElementById('saveProjectItems').style.display = "block"
            document.getElementById('saveProjectHeader').style.display = "block"
            console.log('commit result = ' + JSON.stringify(result))
            closeSaveView()
        })
    } catch (e) {
        console.log('error in do the commit = ' + e)
        if (e.toString().indexOf('installed') > -1) {
            ipcRenderer.send('open-get-git-window', '')
        } else {
            alert("Sorry, there was an error saving this version. Please try again.")
        }
    }
}







/*************************************************************************************** */

/***************************** NOT CURRENTLY IN USE  *************************************/

/*
REMOVED ON SEPTEMBER 29, 2021, around 7:15am US ET:
--show send options (for sending to github)
--control the window (for controlling notes)
--check gitchanges, and then if change, convert word to md
--early code for controlling apple notes
*/

