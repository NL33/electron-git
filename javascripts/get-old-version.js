const { ipcRenderer, shell } = require('electron')
const { writeFile, fstat } = require('fs')
const fs = require("fs")
var path = require('path')

var projectFolderPath
var folderName
var versionNumber
var versionTime
var versionNotes

const { promisify } = require('util')

/*****Button Set Up *****/
window.onload = function () {
    projectFolderPath = window.process.argv.slice(-6)[0]
    folderName = window.process.argv.slice(-6)[1]
    versionNumber = window.process.argv.slice(-6)[2]
    versionDate = window.process.argv.slice(-6)[3]
    versionTime = window.process.argv.slice(-6)[4]
    versionNotes = window.process.argv.slice(-6)[5]
    document.getElementById('projectDirectory').textContent = folderName
    var divId = "projectDirectory"
    document.getElementById('versionMessageId').textContent = versionNotes
    document.getElementById('versionNumberId').textContent = versionNumber
    document.getElementById('versionDateId').textContent = versionDate
    document.getElementById('versionTimeId').textContent = versionTime
    showFolderContents(divId, projectFolderPath, 0)
    menuFunction()
}


/*************************VIEW PRIOR VERSIONS ********************* */


function openDoc(thePath) {
    let theExtension = path.extname(thePath)
    console.log('in old version js. path = ' + thePath)
    if (theExtension.includes('html')) {
        ipcRenderer.send('open-html-window', thePath)

    } else {
        shell.openPath(thePath)
    }
}


/******Select Project Folder to show folder contents*******/

function changeFolder() {
    ipcRenderer.send('open-folder-dialog', '')
}

ipcRenderer.on('selected-folder', (event, pathToFolder) => {
    document.getElementById('folderContents').innerHTML = ''
    projectFolderPath = pathToFolder.toString()
    let dataArray = projectFolderPath.split("/")
    folderName = dataArray[dataArray.length - 1]
    document.getElementById('projectDirectory').textContent = folderName
    var divId = "projectDirectory"
    showFolderContents(divId, projectFolderPath, 0)
    if (projectFolderPath.length > 0) { //should always be true, but adding a doublecheck
        let array = [projectFolderPath, folderName]
        localStorage.setItem('lastProjectFolder', JSON.stringify(array))
    }
})

/******Loop through contents of Selected Folder and display results************* */

async function showFolderContents(divId, mainPath, indent) {
    console.log(divId, mainPath, indent)
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

        var newName = 'n/a'
        if (extension) {
            hasExtension = true
        }
        /*
        //why this? Below, with stats.isDirectory(), you can check if something is a directory. However, this misses a few special types of "directories"--which are really complex files. For example logicX files. These files show up as directories with isDirectory(), but when you click on them, you normally want to open them, not view the contents. So this code pickes up these cases.
        */
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
                        var itemExtension = path.extname(fullPath)
                        if ((subStats.isDirectory() === true) && (!(itemExtension))) {  //item extension is to pick up times when fs doesn't show a directory but it has an extension, like logicx docs
                            var newId = "**is-directory**^^^" + fullPath + "^^^" + indent
                            contents = `<div >
                        <div class='subFolder docOrDirectory' style='margin-left: ${indent}px' id="${newId}" onclick='showFolderContents("${newId}", "${fullPath}", "${newIndent}")'><img src="../clear-folder-fntawesome.svg" class="folderIcon"></img>` + item + `</div>
                        <div class="newItems"></div>
                        </div>`
                        } else {
                            var newNamePath = fullPath
                            var theName = item
                            if (!(item.includes('*OLD*'))) {
                                var currentFullPath = mainPath + '/' + item
                                var newNamePath = mainPath + '/*OLD*' + item
                                theName = '*OLD*' + item
                                fs.rename(currentFullPath, newNamePath, function (err) {
                                    if (err) console.log('error = ' + err)
                                })
                            }

                            var newId = "**is-document**^^^" + newNamePath + "^^^" + indent
                            contents = `<div >
                        <div class='subFolder docOrDirectory' style='margin-left: ${indent}px' id="${newId}" onclick='showFolderContents("${newId}", "${newNamePath}", "${newIndent}")'>` + theName + `</div>
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
            } else {  //if not a directory. /***START HERE: FOR ITEM THAT IS PICKED UP AS NOT DIRECTORY BUT HAS EXTENSION, ADD the "OLD" TO IT */
                openDoc(mainPath)

            }
        } else { //if not projectstart and DO have clicked (so a folder that is already open)
            element.classList.remove('clicked')
            var newItems = element.nextElementSibling
            newItems.innerHTML = '' //remove items in newItems
        }
    } catch (e) {
        console.log('e in show folder contents function = ' + e)
        alert("There was an error loading the files. Sorry about that. Please close this window and try again.")
    }
}


/************Menu Function****************/
//removed bc when viewing old versions you should not be able to add or delete files
function menuFunction() {

}


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

