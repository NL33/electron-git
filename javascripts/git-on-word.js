const { ipcRenderer, clipboard, shell, remote } = require('electron')
const { Menu, MenuItem } = remote
const { writeFile, fstat } = require('fs')
const fs = require("fs")
const simpleGit = require('simple-git')
const git = simpleGit()
var TurndownService = require('turndown')
var turndownService = new TurndownService()

const homeDir = require('os').homedir();
const desktopDir = `${homeDir}/Desktop`;
var appFolder = desktopDir + '/app-versions'

var folderPath
var folderName
var fileName
var currentWindow

let spawn = require("child_process").spawn
var cp = require("child_process");

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
        addFile()
    })

    menuFunction()

}


/*****Experiments with Micro Word ********/

function wordExps() {
    fs.writeFile('/Users/sean/Desktop/word-test/crazy-doc1.docx', '', (err) => {
        if (err) {
            console.log('error = ' + err)
        } else {
            console.log('doc saved')
        }
    })
}


/******Select Project Folder*******/

function changeFolder() {
    ipcRenderer.send('open-folder-dialog', '')
}

ipcRenderer.on('selected-folder', (event, pathToFolder) => {
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

/************Menu Function****************/

function menuFunction() {
    const contextMenu = new Menu();

    window.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        contextMenu.popup(remote.getCurrentWindow());
        var fullId = e.target.id
        if (fullId.includes('**is-directory**')) { //show this menu only if a directory
            var idArray = fullId.split("^^^")
            var thePath = idArray[1]
            var indent = idArray[2]
            console.log('indent = ' + indent)
            const menuItem = new MenuItem({
                label: "New Folder",
                click: () => {
                   // addFolder(e, thePath, indent)
                   var divId = fullId  
                   enterNewFolder(divId, thePath, indent) 
                }
            })
            contextMenu.clear() //remove prior menuItem
            contextMenu.append(menuItem)
        }

    }, false);
}

/****ENTER NEW FOLDER ********* */

function enterNewFolder(divId, mainPath, indent) {
    var element = document.getElementById(divId)
    contents = `<input id="nameEntry" data-placeholder="folder name">
    <button id="addButton" onclick='addFolder("${divId}", "${mainPath}", "${indent}")'>enter</button>`
    /*
    contents = `<input id="nameEntry" data-placeholder="folder name">
    <button onclick="hi()">enter</button>`
    */
    var newItems = element.nextElementSibling  //gets "newItems" div
    newItems.insertAdjacentHTML("afterBegin", contents)  //insert into newItems
}

/***********Create a Folder****/
function addFolder(divId, path, indent) {
    var folderName = document.getElementById('nameEntry').value
    document.getElementById('nameEntry').remove()
    document.getElementById('addButton').remove()
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
            if (element.classList.contains('clicked')){
                //the folder that's getting the new folder is already open (ie, showing its contents), so just add the single new folder
                showNewFolder(divId, path, newPath, folderName, newIndent)
            } else {
                //folder that's getting the new folder is not displaying its contents, so just show all contents like normal
                showFolderContents(divId, path, newIndent)
            }
            
        }
    })
}

/**************** showNewFolder  *******************/

function showNewFolder(divId, mainPath, newPath, folderName, indent) {
    var element = document.getElementById(divId)
    var contents = ""
    var newIndent = parseInt(indent) + 15
    var fullPath = newPath
    var newId = "**is-directory**^^^" + fullPath + "^^^" + indent
    contents = `<div >
                <div class='subFolder' style='margin-left: ${indent}px' id=${newId} onclick='showFolderContents("${newId}", "${fullPath}", "${newIndent}")'>` + folderName + `</div>
                <div class="newItems"></div>
                </div>`
    var newItems = element.nextElementSibling  //gets "newItems" div
    newItems.insertAdjacentHTML("afterBegin", contents)  //insert into newItems
    // event.target.classList.add('clicked') //add clicked class so don't run this again if click again
}

/**************Create a Doc ***********/

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
                    var newId = "**is-directory**^^^" + fullPath + "^^^" + indent
                    contents = `<div >
                <div class='subFolder' style='margin-left: ${indent}px' id="${newId}" onclick='showFolderContents("${newId}", "${fullPath}", "${newIndent}")'>` + item + `</div>
                <div class="newItems"></div>
                </div>`
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

/************FOLDER ACTIONS **********/



/********GIT ACTIONS*************** */

function addFile() { //get the text of the file and the first line of the file
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
