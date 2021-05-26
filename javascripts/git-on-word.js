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


var folderPath
var folderName
var fileName
var currentWindow

let spawn = require("child_process").spawn
var cp = require("child_process");
const { promisify } = require('util')
const { resolve } = require('path')

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
            folderPath = folderArray[0]
            folderName = folderArray[1]
            document.getElementById('projectDirectory').textContent = folderName
            var divId = "projectDirectory"
            showFolderContents(divId, folderPath, 0)

            checkGitChangeTime(folderPath)
            //getContents(folderPath)
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
        saveProjectVersionFunction()
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
    folderPath = pathToFolder.toString()
    let dataArray = folderPath.split("/")
    folderName = dataArray[dataArray.length - 1]
    document.getElementById('projectDirectory').textContent = folderName
    var divId = "projectDirectory"
    showFolderContents(divId, folderPath, 0)
    if (folderPath.length > 0) { //should always be true, but adding a doublecheck
        let array = [folderPath, folderName]
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
                var thePath = folderPath
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
            return checkChangesFunction(theFilePath, lastSaveTime)
        }).catch((e) => {
            console.log('error')
        })
    } else {
        lastSaveTime = 0
    }
}


/**THe below function runs a loop. When it analyzes and converts a word doc, that goes on a different track and happens slower. That is ok
 the question is: how to call the next stage (git actions), only once all word docs have been addressed?
 Potential Answer:
 in the first loop, don't do the asynchronous work. use that work to get all the filePaths for word docs that need to be worked on.
 Then, for all those filepaths, do the asynchronous magic work.
 once you've done so for all the paths in the word array, then and only then call the git function
 /******START HERE********* */
 

async function checkChangesFunction(theFilePath, lastSaveTime) {
    var newStat = promisify(fs.stat)
    var projectFolder = theFilePath
    var projectContents = await fs.readdirSync(projectFolder)
    //gets the top level
    try {
    for (var i = 0; i < projectContents.length; i++) {
        if ((projectContents[i] != ".DS_Store") && (projectContents[i] != ".git")) {
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
                            convertWord(filePath)
                        } else {
                            return 'done'
                        }
                    }
                } else { //if it has not been modified since the last git save, then we are done with this item in the loop
                    console.log('2c. has not been modified since last git save')
                }

            }).catch((e) => {
                console.log('error hereo= ' + JSON.stringify(e))
            })  //end stat
        } //end if not ds_store or git
    } //end projectContents loop
} catch (e){

}
console.log("AALLLL DONNE!")
} //end check Changes Function

function convertWord(wordPath) {
    console.log('got called')
    mammoth.convertToHtml({ path: wordPath }).then((result, err) => {
        var htmlWord = result.value
        //return 'done'
        convertTheDataToMarkdown(wordPath, htmlWord)
    }).catch((e) => {
        console.log('error here  = ' + e)
    })
}


async function convertTheDataToMarkdown(wordPath, htmlData) {
    try {
        console.log('now do turndown')
        var data = await turndownService.turndown(htmlData)
        var dataCleaned = data.replace(/<!--.*?-->/s, "");  //at this point, have converted the word doc to markdown, and removed the first commented out code that word docs have that take up a lot of space but are not necessary from the markdown version
        var removeExt = wordPath.replace(/\.[^/.]+$/, "")
        console.log('#*#&#&#&#&#&#&#&#&#remove ext = ' + removeExt)
    } catch (e) {
        console.log(e)
    }
}

/*
var markdownFilePath = folderPath + '/' + fileName + '.md'
console.log('filepath = ' + filePath)
writeFile(filePath, dataCleaned, (err) => {
    if (err) throw err;
    saveVersion()
})
*/


function anotherConvertFunction() {
    var data1 = clipboard.readHTML()
    var data = turndownService.turndown(data1)
    //#get first 6 words of first line to propose as possible file name:

    //## clear out <!--  ... --> text in beginning, which is there in microsoft word docs
    var dataCleaned = data.replace(/<!--.*?-->/s, "");
    //## get first line
    var dataArray = dataCleaned.split('\n')
    var firstLine = 'none'
    var i
    for (i = 0; i < 6; i++) { //loop through first six lines to be sure there is text there
        if (dataArray[i].trim().length > 0) {
            console.log('there is a value at ' + i)
            firstLine = dataArray[i].trim()
            break; //stop loop if have text in the line
        }
    }
    //## isolate first 6 words of the first line
    if (firstLine != 'none') {
        console.log('first line = ')
        console.log(firstLine)
        var lineArray = firstLine.split(" ")
        var n
        var firstLineSum = ''
        for (n = 0; n < 6; n++) {
            if (n < 1) {
                firstLineSum = lineArray[0]
            } else {
                firstLineSum += ' '
                firstLineSum += lineArray[n]
            }
        }
        console.log('first 6 words of first line = ')
        console.log(firstLineSum)
    } else {
        console.log('no first line')
    }
    //end get first line
    writeFileFunction(dataCleaned)
    // fs.writeFile()
    // saveVersion()
}

function writeFileFunction(dataCleaned) {
    var filePath = folderPath + '/' + fileName + '.md'
    console.log('filepath = ' + filePath)
    writeFile(filePath, dataCleaned, (err) => {
        if (err) throw err;
        saveVersion()
    })
}

async function saveVersion() {
    console.log('in save version')
    var text = document.getElementById('noteForSave').textContent
    try {
        await git.cwd(folderPath).then(result => {
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
            console.log('commit result = ' + JSON.stringify(result))
        })

    }
    catch (e) {
        console.log('error = ' + e)
    }
}
