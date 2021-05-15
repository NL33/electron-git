const {ipcRenderer, clipboard} = require('electron')
const { writeFile, fstat } = require('fs')
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


window.onload = function () {
    ipcRenderer.on('window-title', (event, data) => {
        console.log('got data')
        document.getElementById('selectedDoc').textContent = data
        fileName = data
    })
    var currentWindow = localStorage.getItem('current-window')
    if (localStorage.getItem('lastProjectFolder')) {
        let folderArray = JSON.parse(localStorage.getItem('lastProjectFolder'))
        if (folderArray){
            folderPath = folderArray[0]
            folderName = folderArray[1]
            document.getElementById('directory').textContent = folderName
        }
    }
    var changeFolderButton = document.getElementById('changeFolder')
    changeFolderButton.addEventListener('click', () => {
        changeFolder()
    })

    document.getElementById('saveButton').addEventListener('click', ()=>{
       addFile()
    })
}

/************FOLDER ACTIONS **********/

function changeFolder() {
    ipcRenderer.send('open-folder-dialog', '')
}

ipcRenderer.on('selected-folder', (event, pathToFolder) => {
    folderPath = pathToFolder.toString()
    let dataArray = folderPath.split("/")
    folderName = dataArray[dataArray.length - 1]
    document.getElementById('directory').textContent = folderName
    if (folderPath.length > 0){ //should always be true, but adding a doublecheck
        let array = [folderPath, folderName]
        localStorage.setItem('lastProjectFolder', JSON.stringify(array))
    }
})


/********GIT ACTIONS*************** */

function addFile(){ //get the text of the file and the first line of the file
    var data1 = clipboard.readHTML()
    var data = turndownService.turndown(data1)
    //#get first 6 words of first line to propose as possible file name:

    //## clear out <!--  ... --> text in beginning, which is there in microsoft word docs
    var dataCleaned = data.replace(/<!--.*?-->/s, "");
    //## get first line
    var dataArray = dataCleaned.split('\n')
    var firstLine = 'none'
    var i
    for (i = 0; i < 6; i++){ //loop through first six lines to be sure there is text there
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
        for (n = 0; n < 6; n++){
            if (n < 1){
                firstLineSum = lineArray[0]
            } else {
                firstLineSum+= ' '
                firstLineSum+= lineArray[n]
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

function writeFileFunction(dataCleaned){
    var filePath = folderPath + '/' + fileName + '.md'
    console.log('filepath = ' + filePath)
    writeFile(filePath, dataCleaned, (err) => {
      if (err) throw err;
      saveVersion()  
    } )
}

async function saveVersion(){
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
