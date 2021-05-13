const {clipboard} = require('electron')
const simpleGit = require('simple-git')
const git = simpleGit()
const homeDir = require('os').homedir();
const desktopDir = `${homeDir}/Desktop`;
var appFolder = desktopDir + '/app-versions'
var TurndownService = require('turndown')
var turndownService = new TurndownService()

window.onload = function () {
    var saveButton = document.getElementById('saveButton')
    saveButton.addEventListener('click', () =>{
        saveFile() 
    })  
}

function saveFile(){
    var data1 = clipboard.readHTML()
    var data = turndownService.turndown(data1)
    var dataCleaned = data.replace(/<!--.*?-->/s, "");
    console.log('first linesa = ')
    console.log(dataCleaned)
   // fs.writeFile()
   // saveVersion()
}

async function saveVersion(){
    console.log('in save version')
    var text = document.getElementById('saveNote').textContent
    try {
        await git.cwd(appFolder).then(result => {
            // console.log('cwd resultss' + JSON.stringify(result))
        })

        await git.init().then(result => {
            //console.log('init result = ' + JSON.stringify(result))
        })

        await git.add('.').then(result => {
            //console.log('add result = ' + JSON.stringify(result))
        })

        await git.commit(text).then(result => {
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
            console.log('commit result = ' + JSON.stringify(result))
        })

    }
    catch (e) {
        console.log('error = ' + e)
    }
}
