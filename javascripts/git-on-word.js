const { ipcRenderer, ipcMain, clipboard, shell, remote } = require('electron')
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

const runJxa = require('run-jxa')

var projectFolderPath
var projectFolderName
var fileName

let spawn = require("child_process").spawn
var cp = require("child_process");
const { promisify } = require('util')
const { resolve } = require('path')
const { O_DIRECTORY } = require('constants')
const { shouldRebuildNativeModules } = require('electron-rebuild')
var diff2html = require("diff2html").Diff2Html
/*****Button Set Up *****/
window.onload = function () {
    console.log('in activate')
  /****** REMOVE ANY WORK TREES CREATED BY THE APP*********** */
    if (localStorage.getItem('working-trees-present')) {
        let treeArray = JSON.parse(localStorage.getItem('working-trees-present'))
        if (treeArray.length > 0) {
            treeArray.forEach((treePath) => {
                if (treePath.length){
                    removeSavedWorkTree(treePath)
                }
            })
        }
    }



    /*
    //SAVING INDIVIDUAL FILES. NOT CURRENTLY IN USE.
    //receives info from main.js about the active window
    ipcRenderer.on('window-title', (event, data) => {  
        document.getElementById('selectedDoc').textContent = data
        fileName = data
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
    //seeWhichFilesChangedFunction()

}

/******FUNCTION TO REMOVE ANY WORK TREES CREATED BY THE APP************ */

async function removeSavedWorkTree(treePath) {
    console.log('in remove tree')
    await trash([treePath]).then((error) => {
        console.log('removed work tree = ' + treePath)
        if (error){
            console.log(error)
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
    projectFolderName = dataArray[dataArray.length - 1]
    document.getElementById('projectDirectory').textContent = projectFolderName
    var divId = "projectDirectory"
    showFolderContents(divId, projectFolderPath, 0)
    if (projectFolderPath.length > 0) { //should always be true, but adding a doublecheck
        let array = [projectFolderPath, projectFolderName]
        localStorage.setItem('lastProjectFolder', JSON.stringify(array))
    }
})

/******Loop through contents of Selected Folder and display results************* */

async function showFolderContents(divId, mainPath, indent) {
    var element = document.getElementById(divId)
    var extension = path.extname(mainPath)
    var hasExtension = false
    if (extension) {
        hasExtension = true  //why this? Below, with stats.isDirectory(), you can check if something is a directory. However, this misses a few special types of "directories"--which are really complex files. For example logicX files. These files show up as directories with isDirectory(), but when you click on them, you normally want to open them, not view the contents. So this code pickes up these cases.
        console.log('it has extension = ' + extension)
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
                if ((item != '.DS_Store') && (item != ".git") && (!(item.includes('worktree3#&7#&1#&4')))) {
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


/*************** SELECT OLD VERSIONS TO COMPARE CHANGES ********************/
//PriorChanges
document.getElementById('viewPriorVersionsForCompare').addEventListener('click', () => {
    viewPriorVersionsForCompareFunction()
})


async function viewPriorVersionsForCompareFunction() {
    document.getElementById('showPriorCommitsForCompare').innerHTML = ''
    try {
        await git.cwd(projectFolderPath).then(result => {
            // console.log('cwd results' + JSON.stringify(result))
        })

        await git.log().then(result => {
            var resultArray = result.all
            var totalNumber = resultArray.length
            var commitForCompareDiv = document.getElementById('showPriorCommitsForCompare')
            var savedVersionsHeader = document.getElementById('savedVersionsOverview')
            savedVersionsHeader.style.display = "block"
            for (var i = 0; i<resultArray.length; i++) {
                var commit = resultArray[i]
                var versionNumber = totalNumber--
                var versionMessage = commit.message
                var dateTime = commit.date
                var commitNumber = commit.hash

                var dateObject = new Date(dateTime)
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
                contents = `
                <div class="versionOverviewClass" onclick='selectVersionToViewChanges(event, "${commitNumber}", "${versionNumber}", "${showDate}", "${cleanedTime}", "${versionMessage}")'>
                    <div class="versionMessage">${versionMessage}</div>
                    <span class="versionNumber">Version ${versionNumber}</span>
                    <span class="versionDateTime">${showDate}</span><span> ${cleanedTime}</span>
                </div>   
                `
                commitForCompareDiv.insertAdjacentHTML("beforeEnd", contents)
                if (i === 0){
                    var headerInsert = `
                    <span class="selectedForChangesClass">
                        <span class="laterVersionNumber"><span id="versionWordLater">Version </span><span id="versionNumberLater">${versionNumber}</span></span>
                        <div class="laterVersionMessage" style="display:none">${versionMessage}</div>       
                        <span class="laterVersionDate" style="display:none">${showDate}</span><span class="laterVersionTime" style="display:none"> ${showTime}</span>
                    </span>   
                    `
                    document.getElementById('earlierVersionOverview').innerHTML = headerInsert
                    document.getElementById('showPriorCommitsForCompare').firstElementChild.id="selectedChangeId2"
                }
            }
        })
    }
    catch (e) {
        console.log('error = ' + e)
    }
}

function selectVersionToViewChanges(event, commitNumber, versionNumber, showDate, showTime, versionMessage){
    //idea--when you click, the clicked item of the lower version always is put later
   //ids = selectedChangeId1, and selectedChangeId2.
   var selectedDiv = event.target
   if ((selectedDiv.id !== 'selectedChangeId1') || (selectedDiv.id !== 'selectedChangeId2')){
       document.getElementById('selectedChangeId1').id = ''
       selectedDiv.id = 'seletedChangeId1'
       if ((currentVersionLater === 'current') || (thisVersionNumber < parseInt(currentVersionLater))) {
           var earlierChangeDiv = document.getElementById('earlierVersionOverview')
           var contents = `
            <span class="selectedForChangesClass" id="${commitNumber}, ${versionNumber}, ${showDate}, ${showTime}, ${versionMessage}">
                <span class="laterVersionNumber"><span id="versionWordEarlier">Version </span><span id="versionNumberEarlier">${versionNumber}</span></span>
                <div class="laterVersionMessage" style="display:none">${versionMessage}</div>       
                <span class="laterVersionDate" style="display:none">${showDate}</span><span class="laterVersionTime" style="display:none"> ${showTime}</span>
            </span>   
            `
           earlierChangeDiv.innerHTML = contents
       } else {
           var laterChangeDiv = document.getElementById('laterVersionOverview')
           var contents = `
            <span class="selectedForChangesClass" id="${commitNumber}, ${versionNumber}, ${showDate}, ${showTime}, ${versionMessage}">
                <span class="laterVersionNumber"><span id="versionWordLater">Version </span><span id="versionNumberLater">${versionNumber}</span></span>
                <div class="laterVersionMessage" style="display:none">${versionMessage}</div>       
                <span class="laterVersionDate" style="display:none">${showDate}</span><span class="laterVersionTime" style="display:none"> ${showTime}</span>
            </span>   
            `
           laterChangeDiv.innerHTML = contents
       }
   }
   
   
   
   
   
   
    if (document.getElementById('versionNumberLater')){
        var currentVersionLater = document.getElementById('versionNumberLater').textContent
    } else {
        var currentVersionLater = 'n/a'
    }

    var thisVersionNumber = parseInt(versionNumber)

    if (event.target.classList.contains('versionOverviewClass')) {
        var selectedDiv = event.target
    } else {
        var selectedDiv = event.target.closest('.versionOverviewClass')
    }

    if (selectedDiv.classList.contains('selectedChangeClass')){
        selectedDiv.classList.remove('selectedChangeClass')
        if (selectedDiv.classList.contains('selectedChangeClassEarlier')){
            selectedDiv.classList.remove('selectedChangeClassEarlier')
            document.getElementById('earlierVersionOverview').innerHTML = ''
        } else {
            selectedDiv.classList.remove('selectedChangeClassLater')
            document.getElementById('laterVersionOverview').innerHTML = ''
        }
    } else {
        if ((currentVersionLater === 'current') || (thisVersionNumber < parseInt(currentVersionLater))){
            var earlierChangeDiv = document.getElementById('earlierVersionOverview')
            var contents = `
            <span class="selectedForChangesClass" id="${commitNumber}, ${versionNumber}, ${showDate}, ${showTime}, ${versionMessage}">
                <span class="laterVersionNumber"><span id="versionWordEarlier">Version </span><span id="versionNumberEarlier">${versionNumber}</span></span>
                <div class="laterVersionMessage" style="display:none">${versionMessage}</div>       
                <span class="laterVersionDate" style="display:none">${showDate}</span><span class="laterVersionTime" style="display:none"> ${showTime}</span>
            </span>   
            `
            earlierChangeDiv.innerHTML = contents
            selectedDiv.classList.add('selectedChangeClass')
            selectedDiv.classList.add('selectedChangeClassEarlier')
            
        } else {
            var laterChangeDiv = document.getElementById('laterVersionOverview')
            var contents = `
            <span class="selectedForChangesClass" id="${commitNumber}, ${versionNumber}, ${showDate}, ${showTime}, ${versionMessage}">
                <span class="laterVersionNumber"><span id="versionWordLater">Version </span><span id="versionNumberLater">${versionNumber}</span></span>
                <div class="laterVersionMessage" style="display:none">${versionMessage}</div>       
                <span class="laterVersionDate" style="display:none">${showDate}</span><span class="laterVersionTime" style="display:none"> ${showTime}</span>
            </span>   
            `

            laterChangeDiv.innerHTML = contents
            selectedDiv.classList.add('selectedChangeClass')
            selectedDiv.classList.add('selectedChangeLater')
        }
    }

    /*



    if (selectedDiv.classList.contains('selectedChangeClass2')){
        selectedDiv.classList.remove('selectedChangeClass2')
    } else if (selectedDiv.classList.contains('selectedChangeClass1')){
        selectedDiv.classList.remove('selectedChangeClass1')
        selectedDiv.classList.add('selectedChangeClass2')
    } else {
        selectedDiv.classList.add('selectedChangeClass1')
    }
    
    var laterChangeDiv = document.getElementById('laterVersionForChanges')
    var earlierChangeDive = document.getElementById('earlierVersionForChanges')
    var contents = `
        <span class="selectedForChangesClass" id="${commitNumber}, ${versionNumber}, ${showDate}, ${showTime}, ${versionMessage}">
            <span class="laterVersionNumber"><span id="versionWord1">Version </span><span id="versionNumber1">${versionNumber}</span></span>
            <div class="laterVersionMessage" style="display:none">${versionMessage}</div>       
            <span class="laterVersionDate" style="display:none">${showDate}</span><span class="laterVersionTime" style="display:none"> ${showTime}</span>
        </span>   
        `
    laterChangeDiv.innerHTML = contents
*/
}


/********* GIT DIFF TESTING ******* */

/*
document.getElementById('gitDiffWord').addEventListener('click', () => {
    gitDiffFunctionWord()
})


async function gitDiffFunctionWord() {
    try {
        await git.cwd(projectFolderPath).then(result => {
            // console.log('cwd resultss' + JSON.stringify(result))
        })

        await git.diffSummary().then(result => {
            console.log('first summary = ' + JSON.stringify(result))
            var resultArray = result.files
            result.files.forEach((item)=>{
                var file = item.file
                var newId = '#' + file
                var contents = `<div><a href="${newId}">${file}</a><div>`
                document.getElementById('diffWordSummary').insertAdjacentHTML('afterbegin', contents)
            })
           // document.getElementById('showDiffWord').innerHTML = JSON.stringify(result)
        })

        await git.diff('--word-diff', '--no-index').then(result => {    
            //console.log('word diff result = ')
            //console.log(result)
            var red = result.replace(/\[-/g, '<del style="color: #c00">')
            var endred = red.replace(/-]/g, '</del>')
            //var green = endred.replace(/{\+/g, '<ins style="color: #0c0">')//lighter green color
            //var green = endred.replace(/{\+/g, '<ins style="color: #009900">') //dark green color
            var green = endred.replace(/{\+/g, '<ins style="color: #0066cc; font-weight: bold">')  //blue color
            var endgreen = green.replace(/\+}/g, '</ins>')
            var resultArray = endgreen.split('diff --git a/')
            for (var i = 1; i < resultArray.length; i++) {
                var fileName = resultArray[i].split(" ")[0]
                var contents = `
                <hr style="width: 95%; border: 2px solid  #32cd53; margin-bottom: 15px; margin-top: 15px; border-radius: 15px;">
                <div id=${fileName}>
                    <div style="font-weight: bold; font-size: 14pt; margin-top: 0px; margin-bottom: 10px;white-space: pre-wrap">${fileName}</div>
                     <div style="white-space: pre-wrap">${resultArray[i]}</div>
                </div>
                `
                document.getElementById('showDiffWord').insertAdjacentHTML('afterbegin', contents)
            }
        })
    } catch (e) {
        console.log('error in git diff word function = ')
        console.log(e)
    }
}


document.getElementById('gitDiffTop').addEventListener('click', () => {
    gitDiffFunctionTop()
})

async function gitDiffFunctionTop() {
    try {
        await git.cwd(projectFolderPath).then(result => {
            // console.log('cwd resultss' + JSON.stringify(result))
        })

        await git.diff().then(result => {
            doTopDiffFunction(result)
        })
    } catch (e) {
        console.log('error in git diff top function = ')
        console.log(e)
    }
}

async function doTopDiffFunction(result){
    //with diffHTML
 try {
     const Diff2html = require('diff2html');
    const diffJson = await Diff2html.parse(result);
     const diffString = result
     const diffHtml = await Diff2html.html(diffJson, { drawFileList: true });
     document.getElementById('showDiffTop').innerHTML = await diffHtml
    
            /*
//with diff2htmlUI
const configuration = { drawFileList: true, matching: 'lines' };
const targetElement = document.getElementById('displayGitDiff')
const diff2htmlUi = new Diff2HtmlUI(targetElement, diffJson, configuration);
diff2htmlUi.draw();
diff2htmlUi.highlightCode();
*/
/*
 } catch (e){
     console.log('error in doTopDiffFunction = ')
     console.log(e)
 }

}
*/
/********GIT ACTIONS*************** */

async function saveGitVersion() {
    var text = document.getElementById('noteForSave').textContent
    if (text.length < 1) {
        text = "new version saved"
    }
    document.getElementById('saveProjectItems').style.display = "none"
    document.getElementById('savingProgress').style.display = "inline-block"
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
            document.getElementById('savingProgress').style.display = "none"
            document.getElementById('saveProjectItems').style.display = "inline-block"
            console.log('commit result = ' + JSON.stringify(result))
        })

    }
    catch (e) {
        console.log('error = ' + e)
    }
}

/*****************VIEW PRIOR VERSIONS ********************************/

document.getElementById('viewPriorVersionsButton').addEventListener('click', () => {
    viewPriorVersionsFunction()
})


async function viewPriorVersionsFunction() {
    document.getElementById('showPriorCommits').innerHTML = ''
    try {
        await git.cwd(projectFolderPath).then(result => {
            // console.log('cwd resultss' + JSON.stringify(result))
        })

        await git.log().then(result => {
            var resultArray = result.all
            var totalNumber = resultArray.length
            var commitDiv = document.getElementById('showPriorCommits')
            var savedVersionsHeader = document.getElementById('savedVersionsOverview')
            savedVersionsHeader.style.display = "block"
            resultArray.forEach((commit) => {
                var versionNumber = totalNumber--
                var versionMessage = commit.message
                var dateTime = commit.date
                var commitNumber = commit.hash

                var dateObject = new Date(dateTime)
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
                contents = `
                <div class="versionOverviewClass" onclick='showOldVersion("${commitNumber}", "${versionNumber}", "${showDate}", "${cleanedTime}", "${versionMessage}")'>
                    <div class="versionMessage">${versionMessage}</div>
                    <span class="versionNumber">Version ${versionNumber}</span>
                    <span class="versionDateTime">${showDate}</span><span> ${cleanedTime}</span>
                </div>   
                `
                commitDiv.insertAdjacentHTML("beforeEnd", contents)
            })
        })
    }
    catch (e) {
        console.log('error = ' + e)
    }
}
var treeName = 'n/a'
async function showOldVersion(commitNumber, versionNumber, date, time, notes) {
    try {
        await git.cwd(projectFolderPath).then(result => {
            // console.log('cwd resultss' + JSON.stringify(result))
        })

        //prior to creating a new worktree, delete any worktree that's there
        var folderArray = await fs.readdirSync(projectFolderPath)
        /* remove any existing worktree in the project, prior to creating a new one. 
        Note: this means you can't view two different old versions at once. I think that is ok for now.
        */
        folderArray.forEach((item) => {
            if (item.includes('worktree3#&7#&1#&4')) { //if a folder exists that matches the worktree naming convention
                removeWorkTree(item)
            }
        })
      
          //done removing any existing worktree

        console.log('now move on')
        //create worktree, with different name then before
        var randomNumber = Math.floor(Math.random() * 10000)
        var randomMultiple = Math.floor(Math.random() * 500)
        var theNumber = randomNumber * randomMultiple
        treeName = theNumber.toString() + 'worktree3#&7#&1#&4'
        await git.raw('worktree', 'add', treeName).then(result => {
            if (result) {
                console.log(result)
                if (localStorage.getItem('working-trees-present')) {  //local storage array is to keep track of worktrees created, so as to delete them in the case the app is not shut down properly (they would be deleted on startup)
                    let treeArray = JSON.parse(localStorage.getItem('working-trees-present'))
                    treeArray.push(projectFolderPath + '/' + treeName)
                    localStorage.setItem('working-trees-present', JSON.stringify(treeArray))
                    console.log('trees exist')
                } else {
                    let treeArray = []
                    treeArray.push(projectFolderPath + '/' + treeName)
                    localStorage.setItem('working-trees-present', JSON.stringify(treeArray))
                    console.log('trees didnt exist yet')
                }
            } else {
                console.log('error = ')
            }
        })
        //now should have a folder in the directory that is a copy of the directory, with its own git file.
        revertWorkTree(commitNumber, versionNumber, treeName, date, time, notes)
    } catch (e) {
        console.log('error in showOldVersion = ' + e)
    }
}

/*****REMOVE WORKTREE CREATED IN THE PRIOR VERSION WINDOW WHEN CLOSE THE WINDOW***** */
ipcRenderer.on('close-worktree', (event, arg) => {
    removeWorkTree(arg)
})


async function removeWorkTree(treePath) {
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
            await git.raw('worktree', 'prune').then((result) => {
            })
        }
    } catch (e) {
        console.log('error in removework = ' + e)
    }
}

async function revertWorkTree(commitNumber, versionNumber, treeName, date, time, notes) {
    var theArray = []
    var treePath = projectFolderPath + '/' + treeName
    theArray.push(treePath)
    theArray.push(projectFolderName)
    theArray.push(versionNumber)
    theArray.push(date)
    theArray.push(time)
    theArray.push(notes)
    var infoToSend = JSON.stringify(theArray)
    try {
        await git.cwd(treePath).then(result => {
        })

        await git.checkout(commitNumber).then(result => {
            console.log('checkout result = ' + result)
            ipcRenderer.send('open-old-version-window', infoToSend)
        })


    } catch (e) {
        console.log('error in revert function = ' + e)
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

/****************FUNCTIONS TO CONVERT WORD DOCS TO MD ON GIT SAVE ******************/
/*These functions are not currently in use.
The purpose of these functios is to 1. determine last time git file was saved, 2. go through and determine if any word docs have been saved since that time (ie, they are more updated then the last git file), and 3. take those word docs and create markdown file equivalents of them. 
*/
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
            writeFile(markDownPath, dataCleaned, (err) => {
                if (err) {
                    console.log('error = ' + err)
                } else {
                    resolve(dataCleaned)   //completed the conversion for the doc. sends it back to promise.all(promises)
                }
            })
        })
    })
}