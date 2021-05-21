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
            document.getElementById('directory').textContent = folderName
            showFolderContents('projectStart', folderPath, 0)
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
    document.getElementById('directory').textContent = folderName
    showFolderContents('n/a', folderPath, 0)
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
                    addFolder(e, thePath, indent)
                }
            })
            contextMenu.clear() //remove prior menuItem
            contextMenu.append(menuItem)
        }

    }, false);
}


/***********Create a Folder****/
function addFolder(e, path, indent) {
    var newPath = path + '/' + 'go'
    var newIndent = indent + 5
    fs.mkdir(newPath, function (err) {
        if (err) {
            console.log(err)
        } else {
            console.log("New directory successfully created.")
            showFolderContents(e, path, newIndent)
        }
    })
}

/**************Create a Doc ***********/

/*********Get Folder Contents********/

function getContents(folderPath) {
    const getAllFiles = function (dirPath, arrayOfFiles) {
        files = fs.readdirSync(dirPath)

        // arrayOfFiles = []

        files.forEach((file) => {
            if (fs.statSync(dirPath + "/" + file).isDirectory()) {
                arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
            } else {
                arrayOfFiles.push(path.join(__dirname, dirPath, "/", file))
            }
        })

        return arrayOfFiles
    }
}


/******Loop through contents of Selected Folder and display results************* */

async function showFolderContents(event, mainPath, indent) {
    if ((event === 'projectStart') || (!(event.target.classList.contains('clicked')))) {
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
                    contents = `<div id="**is-directory**^^^${fullPath}^^^${indent}">
                <div class='subFolder' style='margin-left: ${indent}px' onclick='showFolderContents(event, "${fullPath}", "${newIndent}")'>` + item + `</div>
                <div class="newItems"></div>
                </div>`
                }
                if (event != "projectStart") {
                    var newItems = event.target.nextElementSibling  //gets "newItems" div
                    newItems.insertAdjacentHTML("beforeEnd", contents)  //insert into newItems
                    event.target.classList.add('clicked')
                } else {
                    var contentsDiv = document.getElementById('folderContents')
                    contentsDiv.insertAdjacentHTML("beforeEnd", contents)
                }
            })
        } else {  //if not a directory
            //   openDoc(mainPath)
        }
    } else { //if not projectstart and DO have clicked 
        event.target.classList.remove('clicked')
        var newItems = event.target.nextElementSibling
        newItems.innerHTML = '' //remove items in newItems
    }
}

/*
async function showFolderContents(description, startPath, indent) {
        var stats = fs.statSync(startPath)
        if (stats.isDirectory() === true) { //determine if a directory (instead of file). 
            //show folder contents
            var contentArray = []
            try {
                contentArray = fs.readdirSync(startPath)       
            } catch (e) {
                console.log(e)
            } 
            var contents = ""
            var newIndent = indent + 15
            var fullPath
            contentArray.forEach((item)=>{
                if ((item != '.DS_Store') && (item != ".git")){
                    fullPath = startPath + '/' + item
                    contents += `<div class='subFolder' id="**is-directory**^^^${fullPath}^^^${indent}" style='margin-left: ${indent}px' onclick='showFolderContents(event, "${fullPath}", "${newIndent}")'><p>` + item + `</p></div>`
                }

                if (description != 'projectStart'){
                    console.log('contents = ' + contents)
                    var contentsDiv = document.getElementById("**is-directory**^^^"+startPath+"^^^"+indent)
                    contentsDiv.appendChild(contents) //appends contents to contentsDiv
                } else {
                    console.log('project loop')
                    var contentsDiv = document.getElementById('folderContents')
                    contentsDiv.innerHTML = contents
                }
                showFolderContents('partOfProject', fullPath, newIndent)
            })
        } else {
            //openDoc(mainPath)
        }
}
*/
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
