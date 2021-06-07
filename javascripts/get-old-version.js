const { ipcRenderer, shell } = require('electron')
const { writeFile, fstat } = require('fs')
const fs = require("fs")
var path = require('path')

const runJxa = require('run-jxa')

var projectFolderPath
var folderName

const { promisify } = require('util')

/*****Button Set Up *****/
window.onload = function () {
    //get last project folder info
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
    //set right click menu 
    menuFunction()
    //seeWhichFilesChangedFunction()

}


/*****Open Doc***** */
var markdownDoc = '/Users/sean/Desktop/markdown-docs/wordtest-markdown.md'
var wordDoc = '/Users/sean/Desktop/word-versions/test-stockholders-agreement-1.docx'
var txtDoc = '/Users/sean/Desktop/txt-docs/converttest-test.txt'
var appleDoc = 'https://www.icloud.com/notes/0hZOhxE5di_MSCv7bX-hYHY8w#Contribution_is_the_Focus'
var notionDoc = 'https://www.notion.so/4d76e0d1943a41b7be78be514c230fd8'

function openDoc(path) {
    shell.openPath(path)
    // controlTheWindow() //this function is for snapping the doc into place
}


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




/***************************** NOT CURRENTLY IN USE  *************************************/



/*********APPLE SCRIPT / JXA***************** */
async function controlTheWindow() {

    try {
        await runJxa(`
    // evalAS :: String -> IO String
   
    const evalAS = s => {
        const
            a = Application.currentApplication(),
            sa = (a.includeStandardAdditions = true, a);
        return sa.doShellScript(
            ['osascript -l AppleScript <<OSA_END 2>/dev/null']
            .concat([s])
            .concat('OSA_END')
            .join('\n')
        );
    };
    var frontAppName = Application("System Events").processes.whose({frontmost: {'=': true }})[0].name();
    var frontApp = Application(frontAppName);
        var insert = 'bounds of first window of application (path to frontmost application as text)'
          return evalAS(insert);
       `
        )
    } catch (e) {
        console.log('error = ' + e)
    }
}

/*
  await runJxa(`
      var frontAppName = Application("System Events").processes.whose({frontmost: {'=': true }})[0].name();
      console.log('front app name = ' + frontAppName)
      var frontApp = Application(frontAppName); //gets the application with that name
     var info = frontApp.windows[0].path()
      console.log('info = ' + info)
      frontApp.windows[0].bounds = {
      "x": 80,
      "y": 80,
      "width": 50,
      "height": 50
      }

      console.log('done')
  `)
  */

/* working function
var its = se.processes.byName('iTunes');



async function controlTheWindow() {
    await runJxa(`
     const wordApp = Application("Microsoft Word")
    //wordDoc.activate()
    wordApp.windows[0].bounds = {
      "x": 2,
      "y": 4,
      "width": 200,
      "height": 200
    }
  `)
}
//this one puts the first window of foreground app in a position:
   await runJxa(`
        var frontAppName = Application("System Events").processes.whose({frontmost: {'=': true }})[0].name();  //gets the name of the process that is currently in front
        var frontApp = Application(frontAppName); //gets the application with that name
        frontApp.windows[0].bounds = {
        "x": 2,
        "y": 4,
        "width": 200,
        "height": 200
        }
    `)

*/

