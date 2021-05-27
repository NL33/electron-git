const { ipcRenderer, clipboard, shell, remote } = require('electron')
const { Menu, MenuItem } = remote
const { writeFile, fstat } = require('fs')
const fs = require("fs")
var path = require('path')
const simpleGit = require('simple-git')
const git = simpleGit()
var TurndownService = require('turndown')
var turndownService = new TurndownService()
var mammoth = require("mammoth");
const trash = require('trash');

const homeDir = require('os').homedir();
const desktopDir = `${homeDir}/Desktop`;
var appFolder = desktopDir + '/app-versions'


var projectFolderPath
var folderName
var fileName
var currentWindow

let spawn = require("child_process").spawn
var cp = require("child_process");
const { promisify } = require('util')
const { resolve } = require('path')
const { O_DIRECTORY } = require('constants')

/*****Button Set Up *****/
window.onload = function () {
    ipcRenderer.on('window-title', (event, data) => {
        console.log('got data')
        document.getElementById('selectedDoc').textContent = data
        fileName = data
    })
    var currentWindow = localStorage.getItem('current-window')
    if (localStorage.getItem('lastProjectFolder')) {
        let folderArray = JSON.parse(localStorage.getItem('lastProjectFolder'))
        if (folderArray) {
            projectFolderPath = folderArray[0]
            folderName = folderArray[1]
            document.getElementById('projectDirectory').textContent = folderName
            var divId = "projectDirectory"
            showFolderContents(divId, projectFolderPath, 0)
        }
    }
    var changeFolderButton = document.getElementById('changeFolder')
    changeFolderButton.addEventListener('click', () => {
        changeFolder()
        //openDocFunction()
        //openDocSpawn()
        // wordExps()
    })

    document.getElementById('saveButton').addEventListener('click', () => {
        checkGitChangeTime(projectFolderPath) //this starts the process to save the git version
    })

    menuFunction()
    //seeWhichFilesChangedFunction()

}


/*********Watch Files***************/

function seeWhichFilesChangedFunction() {
    path = '/Users/sean/Desktop/word-test/'
    fs.stat(path, (err, stats) => {
        if (err) throw err;
        console.log('last update = ' + stats.mtime)
    })
}
//when go to save new version, identify which files have changed since last save. Then update those prior to save.

/******Select Project Folder to show folder contents*******/

function changeFolder() {
    ipcRenderer.send('open-folder-dialog', '')
}

ipcRenderer.on('selected-folder', (event, pathToFolder) => {
    document.getElementById('folderContents').innerHTML = ''
    projectFolderPath = pathToFolder.toString()
    let dataArray = folderPath.split("/")
    folderName = dataArray[dataArray.length - 1]
    document.getElementById('projectDirectory').textContent = folderName
    var divId = "projectDirectory"
    showFolderContents(divId, projectFolderPath, 0)
    if (projectFolderPath.length > 0) { //should always be true, but adding a doublecheck
        let array = [projectFolder, folderName]
        localStorage.setItem('lastProjectFolder', JSON.stringify(array))
    }
})

/******Loop through contents of Selected Folder and display results************* */

async function showFolderContents(divId, mainPath, indent) {
    var element = document.getElementById(divId)
    if ((divId === 'projectDirectory') || (!(element.classList.contains('clicked')))) {
        var stats = fs.statSync(mainPath)
        if (stats.isDirectory() === true) { //determine if a directory (instead of file). 
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
                if ((item != '.DS_Store') && (item != ".git")) {
                    var fullPath = mainPath + '/' + item
                    var subStats = fs.statSync(fullPath)
                    if (subStats.isDirectory() === true) {
                        var newId = "**is-directory**^^^" + fullPath + "^^^" + indent
                        contents = `<div >
                        <div class='subFolder docOrDirectory' style='margin-left: ${indent}px' id="${newId}" onclick='showFolderContents("${newId}", "${fullPath}", "${newIndent}")'>` + item + `</div>
                        <div class="newItems"></div>
                        </div>`
                    } else {
                        var newId = "**is-document**^^^" + fullPath + "^^^" + indent
                        contents = `<div >
                        <div class='subFolder docOrDirectory' style='margin-left: ${indent}px' id="${newId}" onclick='showFolderContents("${newId}", "${fullPath}", "${newIndent}")'>` + item + `</div>
                        </div>`
                    }
                }
                if (divId !== "projectDirectory") {
                    var newItems = element.nextElementSibling  //gets "newItems" div
                    newItems.insertAdjacentHTML("beforeEnd", contents)  //insert into newItems
                    element.classList.add('clicked') //add clicked class so don't run this again if click again
                } else {
                    var contentsDiv = document.getElementById('folderContents')
                    contentsDiv.insertAdjacentHTML("beforeEnd", contents)
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
}


function openDoc(path) {
    shell.openPath(path)
}

/************Menu Function****************/

function menuFunction() {
    const contextMenu = new Menu();

    window.addEventListener('contextmenu', (e) => {

        if ((e.target.id) && (e.target.classList.contains('docOrDirectory'))) {
            var fullId = e.target.id
            contextMenu.clear() //remove prior menuItem
            e.preventDefault();

            if (fullId.includes('**is-directory**')) { //show this menu only if a directory
                var idArray = fullId.split("^^^")
                var thePath = idArray[1]
                var indent = idArray[2]
            } else if (fullId === "projectDirectory") {
                var thePath = projectFolderPath
                var indent = -15
            }
            if ((fullId.includes('**is-directory**')) || (fullId === 'projectDirectory')) {
                contextMenu.append(new MenuItem({
                    label: "New Folder",
                    click: () => {
                        // addFolder(e, thePath, indent)
                        var divId = fullId
                        enterNewFolder(divId, thePath, indent)
                    }
                }))
                contextMenu.append(new MenuItem({
                    label: "New File",
                    click: () => {
                        // addFolder(e, thePath, indent)
                        var divId = fullId
                        enterNewFile(divId, thePath, indent)
                    }
                }))
            }

            if (fullId !== 'projectDirectory') {
                const genMenu = new MenuItem({
                    label: "Move to Trash",
                    click: () => {
                        deleteItem(e)
                    }
                })
                contextMenu.append(genMenu)
            }

            contextMenu.popup(remote.getCurrentWindow());
        } //end if contains docOrDirectory
    }, false);
}
/*old code: onblur="newFolderNoFocus()"*/
/****INPUT TO ENTER NEW FOLDER AND FILE ********* */
/* Steps of creating new folder:
1. enterNewFolder function: adds entry box. When click return in the box, goes to addFolder function
2. add folder does mkdir code., then goes to
3. showNewFolderOrDoc or showFolderContents to show the new folder
*/

function enterNewFolder(divId, mainPath, indent) {
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

function newFolderNoFocus() {
    document.getElementById('addForm').remove()
}

/***********CREATE A FOLDER ********/
function addFolder(divId, path, indent) {
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
}

/******* CREATE A FILE ************/

function createFile(divId, path, indent) {
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
}

/**************** showNewFolder ANd new Doc *******************/

function showNewFolderOrDoc(divId, mainPath, newPath, folderName, indent) {
    //note: right now, this inserts the folder in the view at the top of the view (not alphabetical order)
    var element = document.getElementById(divId)
    var contents = ""
    var newIndent = parseInt(indent) + 15
    var fullPath = newPath
    var statsHere = fs.statSync(fullPath)
    if (statsHere.isDirectory() === true) {
        var newId = "**is-directory**^^^" + fullPath + "^^^" + indent
    } else {
        var newId = "**is-document**^^^" + fullPath + "^^^" + indent
    }
    contents = `<div>
                <div class='subFolder docOrDirectory' style='margin-left: ${indent}px' id=${newId} onclick='showFolderContents("${newId}", "${fullPath}", "${newIndent}")'>` + folderName + `</div>
                <div class="newItems"></div>
                </div>`
    if (divId === 'projectDirectory') { //its the project folder
        var contentsDiv = document.getElementById('folderContents')
        contentsDiv.insertAdjacentHTML("afterBegin", contents)
    } else { //else its a subfolder
        var newItems = element.nextElementSibling  //gets "newItems" div
        newItems.insertAdjacentHTML("afterBegin", contents)  //insert into newItems
    }

}

/*****Open Doc***** */
var markdownDoc = '/Users/sean/Desktop/markdown-docs/wordtest-markdown.md'
var wordDoc = '/Users/sean/Desktop/word-test/word-convert-test1.docx'
var txtDoc = '/Users/sean/Desktop/txt-docs/converttest-test.txt'
var appleDoc = 'https://www.icloud.com/notes/0hZOhxE5di_MSCv7bX-hYHY8w#Contribution_is_the_Focus'
var notionDoc = 'https://www.notion.so/4d76e0d1943a41b7be78be514c230fd8'
function openDocFunction() {

    shell.openPath(wordDoc, '', 'x=10, y=10').then((result) => {
        console.log(result)
    })

    //window.open(txtDoc, '_blank','top=300, left=600')
}

function openDocSpawn() {
    spawn(txtDoc, function (error, stdout, stderr) {
        console.log('done.')
    })
}

/************DELETE A FOLDER***************/

async function deleteItem(e) {
    var fullId = e.target.id
    var item = document.getElementById(fullId)
    var idArray = fullId.split("^^^")
    var thePath = idArray[1]
    await trash([thePath]).then(() => {
        item.remove()
    });
}



/********GIT ACTIONS*************** */

async function checkGitChangeTime(theFilePath) { //check the last time the git file was created
    var newStat = promisify(fs.stat)
    console.log('a. check changes function')
    //if a doc is md, txt, html, etc.--> then I don't need to create a copy of it.
    //if a doc is a word doc (and specific others), then I need to create a copy of it.
    //so one strategy is to find all the word docs in a project, and then see if they have been updated, and then update the copy if they have
    var lastSaveTime
    var gitFile = theFilePath + '/.git'
    if (gitFile) {
        await newStat(gitFile).then((stats, err) => {
            lastSaveTime = stats.mtime
            console.log('b. last save time = ' + lastSaveTime)
            return checkChangesFunction(theFilePath, lastSaveTime) //once have the last updated time, run the function to see what folders have changed since then
            // }).catch((e) => {
            //   console.log('error = ' + e)
        })
    } else {
        lastSaveTime = 0
        return checkChangesFunction(theFilePath, lastSaveTime) //once have the last updated time, run the function to see what folders have changed since then
    }
}


/**THe below function runs a loop. When it analyzes and converts a word doc, that goes on a different track and happens slower. That is ok
 the question is: how to call the next stage (git actions), only once all word docs have been addressed?
 Potential Answer:
 in the first loop, don't do the asynchronous work. use that work to get all the filePaths for word docs that need to be worked on.
 Then, for all those filepaths, do the asynchronous magic work.
 once you've done so for all the paths in the word array, then and only then call the git function
 /******START HERE********* */
var wordDocs = []
var count = 0
async function checkChangesFunction(theFilePath, lastSaveTime) {
    var newStat = promisify(fs.stat)
    var projectFolder = theFilePath
    var projectContents = await fs.readdirSync(projectFolder)
    count++
    if (count === 1) { //only do this the first time you run through this array, so only do this for the top line of the directory. This will add a fake name at the end of the project contents (not actually adding a file--just for purposes of the loop below). It's a way to know when we've reached the end of the project contents
        var fakeFileName = 'zzz3%$#j488*MN3#@1q9*mxSzp9L0(*g'
        projectContents.push(fakeFileName)
    }
    for (var i = 0; i < projectContents.length; i++) {

        if ((projectContents[i] != 'zzz3%$#j488*MN3#@1q9*mxSzp9L0(*g') && (projectContents[i] != ".DS_Store") && (projectContents[i] != ".git")) {
            var filePath = path.join(projectFolder, projectContents[i]); //get full path of item in the project we're focused on
            console.log('1. filepath = ' + filePath)
            await newStat(filePath).then((stats, err) => {  //gets stats then. and convert fs.stat to a promise that resolves to be sure: 1. it does the analysis of the relevant file before moving on the loop and 2. it resolves, so it does move on when it's done
                if (err) {
                    throw (err)
                }
                let timeModified = stats.mtime //get modified time of item
                if (timeModified > lastSaveTime) { //has it been modified since the last git save? If so, we need to look closer.
                    if (fs.statSync(filePath).isDirectory() === true) { //if a directory, then run this again, until you get to a document
                        //note it may not get here aagain if no contents
                        console.log('2a. file path = ' + filePath + ", **is a directory")
                        return checkChangesFunction(filePath, lastSaveTime)
                    } else { //if it's a file, then see if a word doc. If so, perform magic. If not, then no action necessary cause git can handle file as is.
                        //console.log('in a document')
                        var extension = path.extname(filePath)
                        if (extension.includes('doc')) {
                            wordDocs.push(filePath)
                            console.log('2.b word doc = ' + filePath)
                            return 'done'
                        } else {
                            console.log('2ba. doc but not word doc ')
                            return 'done'
                        }
                    }
                } else { //if it has not been modified since the last git save, then we are done with this item in the loop
                    console.log('2c. has not been modified since last git save')
                    return 'done'
                }

            }).catch((e) => {
                console.log('error hereo= ' + JSON.stringify(e))
            })  //end stat

        } else if (projectContents[i] === 'zzz3%$#j488*MN3#@1q9*mxSzp9L0(*g') {
            console.log('^^^^^^^^^^END LOOP THROUGH PROJECT CONTENTS************')
            console.log('word doc lenght = ')
            console.log(wordDocs.length)
            
            let promises = []
            for (let i = 0; i < wordDocs.length; i++) {
                promises.push(mammothFunction(wordDocs[i]))
                //mammothFunction(wordDocs[i])
            }

            
            Promise.all(promises).then(function (result) {
                console.log('*&*&*&*&*&*& promise all done *&*&*&*&*&*&*&*&*&*&*&*&*&*&')
                saveGitVersion()
            })
            

        }//end if not ds_store or git
    } //end projectContents loop
} //end check Changes Function

function mammothFunction(wordDocPath) {
    return new Promise((resolve, reject) => {
        mammoth.convertToHtml({ path: wordDocPath }).then(function (result) {
            var htmlWord = result.value
            var data = turndownService.turndown(htmlWord)
            var dataCleaned = data.replace(/<!--.*?-->/s, "");  //at this point, have converted the word doc to markdown, and removed the first commented out code that word docs have that take up a lot of space but are not necessary from the markdown version
            var removeDocExtension = wordDocPath.replace(/\.[^/.]+$/, "")
            var markDownPath = removeDocExtension + '.md'
            writeFile(markDownPath, dataCleaned, (err)=>{
                if (err){
                    console.log('error = ' + err)
                } else {
                    resolve(dataCleaned)   //completed the conversion for the doc. sends it back to promise.all(promises)
                }
            })
        })
    })
}


async function saveGitVersion() {
    console.log('in save version')
    var text = document.getElementById('noteForSave').textContent
    document.getElementById('saveButton').style.display = "none"
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
            /*
            var overviewS = document.getElementById("ifNewVersionSaved")
            var overviewN = document.getElementById("ifNoNewVersion")
            var showResults = document.getElementById("showResults")
            if (result.summary.changes != "0") {
                overviewN.style.display = "none"
                showResults.textContent = JSON.stringify(result.summary)
                overviewS.style.display = "inline-block"
            } else {
                overviewS.style.display = "none"
                showResults.textContent = ""
                overviewN.style.display = "inline-block"
            }
            */
            document.getElementById('noteForSave').textContent = ''
            document.getElementById('saveButton').style.display = "inline-block"
            console.log('commit result = ' + JSON.stringify(result))
        })

    }
    catch (e) {
        console.log('error = ' + e)
    }
}
